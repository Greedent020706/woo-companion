import { z } from 'zod';
import { paginatedSchema, paginationQuerySchema } from './pagination';

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'on-hold',
  'completed',
  'cancelled',
  'refunded',
  'failed',
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const orderLineItemSchema = z.object({
  productId: z.number().int(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const orderSchema = z.object({
  id: z.number().int(),
  number: z.string(),
  status: orderStatusSchema,
  currency: z.string(),
  total: z.number().nonnegative(),
  createdAt: z.string(),
  customer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  lineItems: z.array(orderLineItemSchema),
});

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
  search: z.string().trim().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
});

export const createOrderInputSchema = z.object({
  lineItems: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1, 'El carrito está vacío'),
});

export const paginatedOrdersSchema = paginatedSchema(orderSchema);

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderLineItem = z.infer<typeof orderLineItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderListQuery = Partial<z.output<typeof orderListQuerySchema>>;
export type ParsedOrderListQuery = z.output<typeof orderListQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
