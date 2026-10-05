import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  count: z.number().int().nonnegative(),
});

export type Category = z.infer<typeof categorySchema>;
