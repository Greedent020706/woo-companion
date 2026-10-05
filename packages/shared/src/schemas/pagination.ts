import { z } from 'zod';

export function paginatedSchema<TItem extends z.ZodType>(itemSchema: TItem) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    perPage: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
}

export type Paginated<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
});
