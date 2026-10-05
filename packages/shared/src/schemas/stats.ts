import { z } from 'zod';
import { orderStatusSchema } from './order';

export const dashboardStatsSchema = z.object({
  currency: z.string(),
  totalRevenue: z.number(),
  ordersCount: z.number().int(),
  productsCount: z.number().int(),
  averageOrderValue: z.number(),
  lowStockProducts: z.array(
    z.object({ id: z.number().int(), name: z.string(), stockQuantity: z.number().int() }),
  ),
  ordersByStatus: z.array(z.object({ status: orderStatusSchema, count: z.number().int() })),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
