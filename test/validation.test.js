import test from 'node:test';
import assert from 'node:assert/strict';
import { schemas, totalCents, stockAfter } from '../src/validation.js';
test('stock cannot become negative', () => { assert.equal(stockAfter(5, -5), 0); assert.throws(() => stockAfter(5, -6), /Insufficient stock/); });
test('money totals use integer cents', () => { assert.equal(totalCents([{ unit_price: 0.1, quantity: 3 }, { unit_price: 0.2, quantity: 1 }]), 50); });
test('orders reject duplicate variants and fractional quantities', () => {
  assert.equal(schemas.order.safeParse({ items: [{ variant_id: 1, quantity: 1, unit_price: 100 }, { variant_id: 1, quantity: 2, unit_price: 100 }] }).success, false);
  assert.equal(schemas.order.safeParse({ items: [{ variant_id: 1, quantity: 1.5, unit_price: 100 }] }).success, false);
});
test('catalog cannot directly modify stock', () => { assert.equal(schemas.variant.safeParse({ product_id: 1, sku: 'A', color: 'Red', size: 'Large', cost: 100, selling_price: 150, stock: 100 }).success, false); });
test('prices reject negative values and excess decimal precision', () => { for (const price of [-1, 1.001]) assert.equal(schemas.order.safeParse({ items: [{ variant_id: 1, quantity: 1, unit_price: price }] }).success, false); });
test('user update allows optional/empty password and valid roles', () => {
  const withoutPwd = schemas.userUpdate.safeParse({ name: 'Admin', email: 'admin@kens.local', role: 'admin', password: '' });
  assert.equal(withoutPwd.success, true);
  assert.equal(withoutPwd.data.password, undefined);
  const withPwd = schemas.userUpdate.safeParse({ name: 'Staff User', email: 'staff@kens.local', role: 'staff', password: 'newpassword123' });
  assert.equal(withPwd.success, true);
  assert.equal(withPwd.data.password, 'newpassword123');
  const shortPwd = schemas.userUpdate.safeParse({ name: 'Staff User', email: 'staff@kens.local', role: 'staff', password: 'short' });
  assert.equal(shortPwd.success, false);
});
