import { z } from 'zod'

const text = z.string().trim().min(1).max(200)
const optionalEmail = z
  .union([z.string().email(), z.literal(''), z.null(), z.undefined()])
  .transform((v) => (!v ? null : v))

const optionalUrl = z
  .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
  .transform((v) => (!v ? null : v))

const optionalText = (max = 500) =>
  z
    .string()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (!v ? null : v))

export const id = z.coerce.number().int().positive()
export const money = z.coerce
  .number()
  .finite()
  .nonnegative()
  .max(9999999)
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001, 'Use at most two decimal places')

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
})

export const CategorySchema = z.object({ name: text })

const partyFields = {
  name: text,
  email: optionalEmail,
  phone: optionalText(40),
  address: optionalText(500),
}
export const SupplierSchema = z.object(partyFields)
export const CustomerSchema = z.object(partyFields)

export const ProductSchema = z.object({
  name: text,
  category_id: id,
  description: optionalText(2000),
  material: optionalText(200),
  image_url: optionalUrl,
})

export const VariantSchema = z.object({
  product_id: id,
  sku: text,
  color: text,
  size: text,
  dimensions: optionalText(200),
  cost: money,
  selling_price: money,
  reorder_level: z.coerce.number().int().nonnegative().max(100000).default(5),
})

export const CreateUserSchema = z.object({
  name: text,
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(['admin', 'staff']),
})

export const UpdateUserSchema = z.object({
  name: text,
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(72)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  role: z.enum(['admin', 'staff']),
  active: z.boolean().optional(),
})

export const UserSchema = CreateUserSchema

export const OrderItemSchema = z.object({
  variant_id: id,
  quantity: z.number().int().positive().max(100000),
  unit_price: money,
})

export const OrderSchema = z
  .object({
    party_id: id.nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    items: z.array(OrderItemSchema.strict()).min(1).max(100),
  })
  .refine((o) => new Set(o.items.map((i) => i.variant_id)).size === o.items.length, 'Duplicate variants are not allowed')

export const ReturnItemSchema = z.object({
  item_id: id,
  quantity: z.number().int().positive().max(100000),
})

export const ReturnSchema = z
  .object({
    items: z.array(ReturnItemSchema.strict()).min(1).max(100),
    reason: z.string().trim().min(3).max(500),
  })
  .refine((o) => new Set(o.items.map((i) => i.item_id)).size === o.items.length, 'Duplicate items are not allowed')

export const AdjustmentSchema = z.object({
  variant_id: id,
  quantity: z.number().int().min(-100000).max(100000).refine((v) => v !== 0, 'Quantity cannot be zero'),
  reason: z.string().trim().min(3).max(500),
})

export type LoginForm = z.infer<typeof LoginSchema>
