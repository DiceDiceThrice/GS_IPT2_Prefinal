# Ken's Marketing Backend

Node.js REST API for a single furniture shop, with MySQL 8+, intended for a school project. The React frontend is maintained separately.

## Setup

1. Install Node.js 22+ and start MySQL 8+.
2. Run `npm install` in this directory.
3. Copy `.env.example` to `.env` and configure database credentials. Set a random `JWT_SECRET` of at least 32 characters and your initial `ADMIN_PASSWORD`.
4. Run `npm run db:setup`. This creates the database, tables, initial admin, and five categories. The database user needs CREATE privileges. Existing admin passwords are not overwritten on reruns.
5. Run `npm run dev` (or `npm start`). Default API URL: `http://localhost:4000/api`.
6. Run `npm test` for business validation checks.

Do not commit `.env`. Configure `CORS_ORIGIN` to your React development URL; comma-separated origins are supported. All timestamps use the MySQL server timezone. Prices use two decimal places; the frontend may display them as Philippine pesos.

## Authentication and Permissions

`POST /api/auth/login` accepts `{ "email": "admin@kens.local", "password": "your-password" }` and returns `{ "token": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "admin" } }`.

Send `Authorization: Bearer <token>` for every endpoint except login and health. Tokens expire after eight hours. `GET /api/auth/me` returns the current user. Account status is checked on every request, so deactivation invalidates access immediately.

Both roles can view records and reports, create/update customers, record sales and purchases, and process returns. Admins additionally create accounts, manage catalog/suppliers, archive records, and adjust stock. `DELETE /api/users/:id` deactivates an account; self-deactivation is blocked.

## API Contract

All paths below are relative to `/api`. JSON request bodies are required. Validation errors return `{ "error": "Validation failed", "details": [...] }`. Other failures return `{ "error": "message" }`. Status codes: 400 invalid input, 401 unauthenticated, 403 forbidden, 404 missing record, 409 conflicting operation, 500 unexpected failure.

| Resource | Endpoints |
| --- | --- |
| Health | `GET /health` (checks database connectivity) |
| Accounts | `GET /users`, `POST /users`, `DELETE /users/:id` |
| Catalog and contacts | `GET`, `POST /categories`, `/suppliers`, `/customers`, `/products`, `/variants`; `GET`, `PUT`, `DELETE /<resource>/:id` |
| Purchases | `GET`, `POST /purchases`; `GET /purchases/:id`; `POST /purchases/:id/returns` |
| Sales | `GET`, `POST /sales`; `GET /sales/:id`; `POST /sales/:id/returns` |
| Stock | `GET /stock/low`, `GET /stock/movements?variant_id=1`, `POST /stock/adjustments` |
| Reports | `GET /reports/dashboard`, `GET /reports/inventory` |

Catalog/contact lists support `?page=1&limit=20&search=oak` and return `{ "data": [...], "total": 10, "page": 1, "limit": 20 }`. Variant search matches SKU; other resources match name. Purchase, sale, and movement lists return arrays of the latest 100 records. Single-record endpoints return objects. Creation returns 201; archiving returns 204. `PUT` requires the complete editable record. Stock is never editable through variant CRUD.

### Request Bodies

```json
{
  "category": { "name": "Dining Tables" },
  "supplier_or_customer": { "name": "Example Contact", "email": null, "phone": "09123456789", "address": "Manila" },
  "product": { "name": "Oak Dining Table", "category_id": 1, "description": "Six-seater", "material": "Oak", "image_url": null },
  "variant": { "product_id": 1, "sku": "TABLE-OAK-NAT-6", "color": "Natural", "size": "6-seater", "dimensions": "180 x 90 x 75 cm", "cost": 8000, "selling_price": 12000, "reorder_level": 3 },
  "user": { "name": "Staff Member", "email": "staff@kens.local", "password": "ChooseYourPassword123", "role": "staff" }
}
```

These are separate endpoint bodies, not a single combined request. Nullable contact fields, descriptions, dimensions, and image URLs may be omitted. Images are stored as URLs; no file upload service is included. Each color/size variant has its own unique SKU and stock count. Newly created variants start at zero stock.

Purchases and sales accept:

```json
{
  "party_id": 1,
  "notes": "Delivery received",
  "items": [{ "variant_id": 1, "quantity": 5, "unit_price": 8000 }]
}
```

`party_id` means supplier ID for purchases (required) and customer ID for sales (nullable for walk-ins). `unit_price` is purchase cost or sale price respectively. Prices are explicit to support negotiated prices; totals are computed on the server. Purchases update the variant's latest cost. Each transaction posts immediately; there are no draft, payment, delivery, tax, or reservation states. Orders cannot be edited or deleted after posting. Correct them through returns. Duplicate variants within an order are rejected.

Returns accept:

```json
{
  "reason": "Customer returned item",
  "items": [{ "item_id": 1, "quantity": 1 }]
}
```

`item_id` is the order item ID from the order detail endpoint, not the variant ID. Partial returns are supported and cannot exceed the original unreturned quantity. Sale returns add stock; purchase returns remove stock. Refund values use the original item price. Returned sale items are treated as sellable; damaged items require an admin stock adjustment.

Admin stock adjustment:

```json
{ "variant_id": 1, "quantity": -1, "reason": "Damaged during storage" }
```

`quantity` is a signed change, not an absolute balance. Use a positive adjustment for opening stock. Every stock change records its resulting balance, user, timestamp, type, and related order. Negative stock is blocked. Transaction failures roll back the whole order/return. Database row locks protect stock under concurrent requests; a contention response can be retried after checking whether the operation posted. The API has no idempotency key support, so avoid automatic retries after an ambiguous network failure.

Dashboard reports include active variant count, units, current-cost inventory value, and all-time purchase/sale totals net of returns. They do not calculate accounting profit or track payments. Archive operations retain transaction history and unique SKUs/emails. Products with active variants, categories with active products, and variants with remaining stock cannot be archived.

## React Integration

```js
const response = await fetch('http://localhost:4000/api/products', {
  headers: { Authorization: `Bearer ${token}` }
});
const body = await response.json();
if (!response.ok) throw new Error(body.error);
const products = body.data;
```

For writes, set `Content-Type: application/json` and serialize the request body. Handle 204 without calling `response.json()`. IDs and quantities are numbers; monetary fields are returned as numbers. Keep the API token in application memory for this demonstration and return to login on 401.

## Verification Scope

`npm test` covers stock underflow, currency rounding, order validation, and protection against direct stock edits. These are unit tests, not a substitute for MySQL integration tests. Before presenting, exercise login, create supplier/customer/product/variant, purchase stock, sell stock, return items, and verify low-stock/history/reports using a disposable database.
