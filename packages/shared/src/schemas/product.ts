import { z } from 'zod';
import { paginatedSchema, paginationQuerySchema } from './pagination';

export const STOCK_STATUSES = ['instock', 'outofstock', 'onbackorder'] as const;
export const PRODUCT_STATUSES = ['publish', 'draft'] as const;

export const stockStatusSchema = z.enum(STOCK_STATUSES);
export const productStatusSchema = z.enum(PRODUCT_STATUSES);

export const productSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  status: productStatusSchema,
  price: z.number().nonnegative(),
  regularPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative().nullable(),
  stockStatus: stockStatusSchema,
  stockQuantity: z.number().int().nullable(),
  categories: z.array(z.object({ id: z.number().int(), name: z.string() })),
  imageUrl: z.string().nullable(),
  shortDescription: z.string(),
  description: z.string(),
  createdAt: z.string(),
});

const priceField = z
  .number({ error: 'Introduce un precio válido' })
  .nonnegative('El precio no puede ser negativo');

export const productInputSchema = z
  .object({
    name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
    sku: z.string().trim().min(1, 'El SKU es obligatorio'),
    status: productStatusSchema,
    regularPrice: priceField,
    salePrice: priceField.nullable(),
    stockQuantity: z
      .number({ error: 'Introduce una cantidad válida' })
      .int('La cantidad debe ser un número entero')
      .nonnegative('La cantidad no puede ser negativa')
      .nullable(),
    categoryIds: z.array(z.number().int()),
    imageUrl: z.union([z.url('Introduce una URL válida'), z.literal('')]).nullable(),
    shortDescription: z.string().max(300, 'Máximo 300 caracteres'),
    description: z.string(),
  })
  .refine((input) => input.salePrice === null || input.salePrice < input.regularPrice, {
    message: 'El precio rebajado debe ser menor que el precio normal',
    path: ['salePrice'],
  });

export const productListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  category: z.coerce.number().int().optional(),
  status: productStatusSchema.optional(),
});

export const paginatedProductsSchema = paginatedSchema(productSchema);

export type StockStatus = z.infer<typeof stockStatusSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductListQuery = Partial<z.output<typeof productListQuerySchema>>;
export type ParsedProductListQuery = z.output<typeof productListQuerySchema>;
