import { Router } from 'express';
import { productInputSchema, productListQuerySchema } from '@woo/shared';
import type { createRequireAuth } from '../auth/require-auth';
import type { DataSource } from '../data-sources/data-source';
import { HttpError, parseIdParam, parseOrThrow } from '../http-error';

export function createProductRoutes(
  dataSource: DataSource,
  requireAuth: ReturnType<typeof createRequireAuth>,
) {
  const router = Router();

  router.get('/', async (request, response) => {
    const query = parseOrThrow(productListQuerySchema, request.query);
    response.json(await dataSource.listProducts(query));
  });

  router.get('/:id', async (request, response) => {
    const product = await dataSource.getProduct(parseIdParam(request.params.id));
    if (!product) throw new HttpError(404, 'Producto no encontrado');
    response.json(product);
  });

  router.post('/', requireAuth('admin'), async (request, response) => {
    const input = parseOrThrow(productInputSchema, request.body);
    response.status(201).json(await dataSource.createProduct(input));
  });

  router.put('/:id', requireAuth('admin'), async (request, response) => {
    const input = parseOrThrow(productInputSchema, request.body);
    const product = await dataSource.updateProduct(parseIdParam(request.params.id), input);
    if (!product) throw new HttpError(404, 'Producto no encontrado');
    response.json(product);
  });

  return router;
}
