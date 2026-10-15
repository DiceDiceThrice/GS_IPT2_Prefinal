import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { pool, query, transaction } from './db.js';
import { schemas, id, totalCents, stockAfter } from './validation.js';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
export function createApp(secret) {
  const app = express();
  app.use(helmet(), cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()) }), express.json({ limit: '100kb' }));
  app.use('/api', rateLimit({ windowMs: 60000, limit: 300 }));
  app.get('/api/health', async (req, res) => { await query('SELECT 1'); res.json({ status: 'ok', shop: "Ken's Marketing" }); });
  app.post('/api/auth/login', rateLimit({ windowMs: 900000, limit: 20 }), async (req, res) => {
    const body = schemas.login.parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE email=? AND active=1', [body.email]);
    if (!user || !await bcrypt.compare(body.password, user.password_hash)) fail(401, 'Invalid email or password');
    res.json({ token: jwt.sign({}, secret, { subject: String(user.id), expiresIn: '8h', algorithm: 'HS256' }), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
  app.use('/api', async (req, res, next) => {
    let payload;
    try { payload = jwt.verify((req.headers.authorization || '').replace(/^Bearer /, ''), secret, { algorithms: ['HS256'] }); } catch { return res.status(401).json({ error: 'Authentication required' }); }
    const [user] = await query('SELECT id,name,email,role FROM users WHERE id=? AND active=1', [id.parse(payload.sub)]);
    if (!user) return res.status(401).json({ error: 'Account unavailable' });
    req.user = user; next();
  });
  const admin = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' });
  app.get('/api/auth/me', (req, res) => res.json(req.user));
  app.get('/api/users', admin, async (req, res) => res.json(await query('SELECT id,name,email,role,active,created_at FROM users ORDER BY id')));
  app.post('/api/users', admin, async (req, res) => {
    const b = schemas.user.parse(req.body);
    const result = await query('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)', [b.name, b.email, await bcrypt.hash(b.password, 12), b.role]);
    res.status(201).json({ id: result.insertId, name: b.name, email: b.email, role: b.role });
  });
  app.delete('/api/users/:id', admin, async (req, res) => {
    const target = id.parse(req.params.id); if (target === req.user.id) fail(409, 'Cannot deactivate your own account');
    const r = await query('UPDATE users SET active=0 WHERE id=?', [target]); if (!r.affectedRows) fail(404, 'User not found'); res.status(204).end();
  });
  const resources = { categories: 'category', suppliers: 'supplier', customers: 'customer', products: 'product', variants: 'variant' };
  for (const [table, schema] of Object.entries(resources)) {
    app.get(`/api/${table}`, async (req, res) => {
      const page = Math.max(1, Number.parseInt(req.query.page) || 1), limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit) || 20));
      const column = table === 'variants' ? 'sku' : 'name';
      const search = String(req.query.search || '').slice(0, 200);
      const where = `active=1 AND ${column} LIKE ?`;
      const [count] = await query(`SELECT COUNT(*) total FROM ${table} WHERE ${where}`, [`%${search}%`]);
      const data = await query(`SELECT * FROM ${table} WHERE ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`, [`%${search}%`]);
      res.json({ data, total: count.total, page, limit });
    });
    app.get(`/api/${table}/:id`, async (req, res) => { const [row] = await query(`SELECT * FROM ${table} WHERE id=? AND active=1`, [id.parse(req.params.id)]); if (!row) fail(404, 'Record not found'); res.json(row); });
    const checkParent = async b => {
      const parent = table === 'products' ? ['categories', b.category_id] : table === 'variants' ? ['products', b.product_id] : null;
      if (parent && !(await query(`SELECT id FROM ${parent[0]} WHERE id=? AND active=1`, [parent[1]])).length) fail(400, 'Parent record unavailable');
    };
    app.post(`/api/${table}`, table === 'customers' ? (req, res, next) => next() : admin, async (req, res) => {
      const b = schemas[schema].parse(req.body); await checkParent(b); const keys = Object.keys(b);
      const result = await query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`, Object.values(b));
      res.status(201).json({ id: result.insertId, ...b });
    });
    app.put(`/api/${table}/:id`, table === 'customers' ? (req, res, next) => next() : admin, async (req, res) => {
      const b = schemas[schema].parse(req.body); await checkParent(b);
      const result = await query(`UPDATE ${table} SET ${Object.keys(b).map(k => `${k}=?`).join(',')} WHERE id=? AND active=1`, [...Object.values(b), id.parse(req.params.id)]);
      if (!result.affectedRows) fail(404, 'Record not found'); res.json({ id: Number(req.params.id), ...b });
    });
    app.delete(`/api/${table}/:id`, admin, async (req, res) => {
      const target = id.parse(req.params.id);
      if (table === 'variants' && (await query('SELECT id FROM variants WHERE id=? AND stock>0', [target])).length) fail(409, 'Remove remaining stock before archiving');
      if (table === 'products' && (await query('SELECT id FROM variants WHERE product_id=? AND active=1', [target])).length) fail(409, 'Archive active variants first');
      if (table === 'categories' && (await query('SELECT id FROM products WHERE category_id=? AND active=1', [target])).length) fail(409, 'Archive active products first');
      const result = await query(`UPDATE ${table} SET active=0 WHERE id=? AND active=1`, [target]); if (!result.affectedRows) fail(404, 'Record not found'); res.status(204).end();
    });
  }
  async function move(db, variantId, delta, type, orderId, reason, userId) {
    const [[v]] = await db.execute('SELECT * FROM variants WHERE id=? FOR UPDATE', [variantId]);
    if (!v) fail(404, 'Variant not found');
    const balance = stockAfter(v.stock, delta);
    await db.execute('UPDATE variants SET stock=? WHERE id=?', [balance, variantId]);
    await db.execute('INSERT INTO stock_movements(variant_id,quantity,balance,type,order_id,reason,created_by) VALUES(?,?,?,?,?,?,?)', [variantId, delta, balance, type, orderId, reason, userId]);
  }
  for (const [route, type] of [['purchases', 'purchase'], ['sales', 'sale']]) {
    app.get(`/api/${route}`, async (req, res) => res.json(await query('SELECT * FROM orders WHERE type=? ORDER BY id DESC LIMIT 100', [type])));
    app.get(`/api/${route}/:id`, async (req, res) => {
      const target = id.parse(req.params.id); const [order] = await query('SELECT * FROM orders WHERE id=? AND type=?', [target, type]); if (!order) fail(404, 'Order not found');
      res.json({ ...order, items: await query('SELECT oi.*,v.sku FROM order_items oi JOIN variants v ON v.id=oi.variant_id WHERE order_id=?', [target]), returns: await query('SELECT * FROM returns WHERE order_id=?', [target]) });
    });
    app.post(`/api/${route}`, async (req, res) => {
      const b = schemas.order.parse(req.body); if (type === 'purchase' && !b.party_id) fail(400, 'Supplier party_id is required');
      const result = await transaction(async db => {
        if (b.party_id) { const [party] = await db.execute(`SELECT id FROM ${type === 'purchase' ? 'suppliers' : 'customers'} WHERE id=? AND active=1 FOR SHARE`, [b.party_id]); if (!party.length) fail(400, 'Supplier/customer unavailable'); }
        // Lock variants in a consistent order to reduce deadlocks across concurrent orders.
        const sorted = [...b.items].sort((a, b) => a.variant_id - b.variant_id);
        for (const item of sorted) {
          const [[v]] = await db.execute('SELECT v.id FROM variants v JOIN products p ON p.id=v.product_id WHERE v.id=? AND v.active=1 AND p.active=1 FOR UPDATE', [item.variant_id]); if (!v) fail(400, 'Variant unavailable');
        }
        const total = totalCents(b.items) / 100;
        const [o] = await db.execute('INSERT INTO orders(type,supplier_id,customer_id,total,notes,created_by) VALUES(?,?,?,?,?,?)', [type, type === 'purchase' ? b.party_id : null, type === 'sale' ? b.party_id : null, total, b.notes, req.user.id]);
        for (const item of sorted) {
          await db.execute('INSERT INTO order_items(order_id,variant_id,quantity,unit_price) VALUES(?,?,?,?)', [o.insertId, item.variant_id, item.quantity, item.unit_price]);
          await move(db, item.variant_id, type === 'purchase' ? item.quantity : -item.quantity, type, o.insertId, null, req.user.id);
          if (type === 'purchase') await db.execute('UPDATE variants SET cost=? WHERE id=?', [item.unit_price, item.variant_id]);
        }
        return { id: o.insertId, type, total };
      }); res.status(201).json(result);
    });
    app.post(`/api/${route}/:id/returns`, async (req, res) => {
      const b = schemas.return.parse(req.body), target = id.parse(req.params.id);
      const result = await transaction(async db => {
        const [[order]] = await db.execute('SELECT * FROM orders WHERE id=? AND type=? FOR UPDATE', [target, type]); if (!order) fail(404, 'Order not found');
        const items = [];
        for (const item of b.items) {
          const [[row]] = await db.execute('SELECT * FROM order_items WHERE id=? AND order_id=? FOR UPDATE', [item.item_id, target]);
          if (!row || row.returned_quantity + item.quantity > row.quantity) fail(409, 'Return exceeds remaining quantity or item does not belong to order');
          items.push({ ...row, return_quantity: item.quantity });
        }
        items.sort((a, b) => a.variant_id - b.variant_id);
        const total = totalCents(items.map(i => ({ unit_price: i.unit_price, quantity: i.return_quantity }))) / 100;
        const [r] = await db.execute('INSERT INTO returns(order_id,total,reason,created_by) VALUES(?,?,?,?)', [target, total, b.reason, req.user.id]);
        for (const item of items) {
          await move(db, item.variant_id, type === 'sale' ? item.return_quantity : -item.return_quantity, `${type}_return`, target, b.reason, req.user.id);
          await db.execute('UPDATE order_items SET returned_quantity=returned_quantity+? WHERE id=?', [item.return_quantity, item.id]);
          await db.execute('INSERT INTO return_items(return_id,order_item_id,quantity) VALUES(?,?,?)', [r.insertId, item.id, item.return_quantity]);
        }
        return { id: r.insertId, order_id: target, total };
      }); res.status(201).json(result);
    });
  }
  app.post('/api/stock/adjustments', admin, async (req, res) => {
    const b = schemas.adjustment.parse(req.body);
    await transaction(async db => { const [[v]] = await db.execute('SELECT id FROM variants WHERE id=? AND active=1 FOR UPDATE', [b.variant_id]); if (!v) fail(404, 'Active variant not found'); await move(db, b.variant_id, b.quantity, 'adjustment', null, b.reason, req.user.id); }); res.status(201).json({ message: 'Stock adjusted' });
  });
  app.get('/api/stock/movements', async (req, res) => { const variant = req.query.variant_id ? id.parse(req.query.variant_id) : null; res.json(await query(`SELECT * FROM stock_movements ${variant ? 'WHERE variant_id=?' : ''} ORDER BY id DESC LIMIT 100`, variant ? [variant] : [])); });
  app.get('/api/stock/low', async (req, res) => res.json(await query('SELECT v.*,p.name product_name FROM variants v JOIN products p ON p.id=v.product_id WHERE v.active=1 AND p.active=1 AND v.stock<=v.reorder_level ORDER BY v.stock')));
  app.get('/api/reports/dashboard', async (req, res) => {
    const [stock] = await query('SELECT COUNT(*) variants, COALESCE(SUM(stock),0) units,COALESCE(SUM(stock*cost),0) inventory_value FROM variants WHERE active=1');
    const totals = await query('SELECT o.type,COALESCE(SUM(o.total-COALESCE(r.refunds,0)),0) net_total,COUNT(*) order_count FROM orders o LEFT JOIN (SELECT order_id,SUM(total) refunds FROM returns GROUP BY order_id) r ON r.order_id=o.id GROUP BY o.type');
    res.json({ ...stock, transactions: totals });
  });
  app.get('/api/reports/inventory', async (req, res) => res.json(await query('SELECT v.*,p.name product_name,c.name category_name,v.stock*v.cost inventory_value FROM variants v JOIN products p ON p.id=v.product_id JOIN categories c ON c.id=p.category_id WHERE v.active=1 ORDER BY p.name,v.sku')));
  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((err, req, res, next) => {
    if (err instanceof ZodError) return res.status(400).json({ error: 'Validation failed', details: err.issues });
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email, SKU, or category already exists' });
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Referenced record does not exist' });
    if (err.code === 'ER_LOCK_DEADLOCK' || err.code === 'ER_LOCK_WAIT_TIMEOUT') return res.status(409).json({ error: 'Concurrent update; retry the request' });
    const status = err.status || 500; if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
  });
  return app;
}
