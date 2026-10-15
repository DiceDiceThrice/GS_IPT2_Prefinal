import { z } from 'zod';
export const id = z.coerce.number().int().positive();
export const money = z.number().finite().nonnegative().max(9999999).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001, 'Use at most two decimal places');
const text = z.string().trim().min(1).max(200);
export const schemas = {
  category: z.object({ name: text }).strict(),
  supplier: z.object({ name: text, email: z.email().nullable().default(null), phone: z.string().max(40).nullable().default(null), address: z.string().max(500).nullable().default(null) }).strict(),
  customer: z.object({ name: text, email: z.email().nullable().default(null), phone: z.string().max(40).nullable().default(null), address: z.string().max(500).nullable().default(null) }).strict(),
  product: z.object({ name: text, category_id: id, description: z.string().max(2000).nullable().default(null), material: z.string().max(200).nullable().default(null), image_url: z.url().nullable().default(null) }).strict(),
  variant: z.object({ product_id: id, sku: text, color: text, size: text, dimensions: z.string().max(200).nullable().default(null), cost: money, selling_price: money, reorder_level: z.number().int().nonnegative().max(100000).default(5) }).strict(),
  user: z.object({ name: text, email: z.email(), password: z.string().min(8).max(72), role: z.enum(['admin', 'staff']) }).strict(),
  userUpdate: z.object({
    name: text,
    email: z.email(),
    password: z.string().min(8).max(72).optional().or(z.literal('')).transform(v => v || undefined),
    role: z.enum(['admin', 'staff']),
    active: z.coerce.boolean().optional(),
  }).strict(),
  login: z.object({ email: z.email(), password: z.string().min(1).max(72) }).strict(),
  order: z.object({ party_id: id.nullable().default(null), notes: z.string().max(1000).nullable().default(null), items: z.array(z.object({ variant_id: id, quantity: z.number().int().positive().max(100000), unit_price: money }).strict()).min(1).max(100) }).strict().refine(o => new Set(o.items.map(i => i.variant_id)).size === o.items.length, 'Duplicate variants are not allowed'),
  adjustment: z.object({ variant_id: id, quantity: z.number().int().min(-100000).max(100000).refine(v => v !== 0), reason: z.string().trim().min(3).max(500) }).strict(),
  return: z.object({ items: z.array(z.object({ item_id: id, quantity: z.number().int().positive().max(100000) }).strict()).min(1).max(100), reason: z.string().trim().min(3).max(500) }).strict().refine(o => new Set(o.items.map(i => i.item_id)).size === o.items.length, 'Duplicate items are not allowed')
};
export function totalCents(items) { return items.reduce((sum, i) => sum + Math.round(i.unit_price * 100) * i.quantity, 0); }
export function stockAfter(current, delta) { const next = current + delta; if (next < 0) throw Object.assign(new Error('Insufficient stock'), { status: 409 }); return next; }
