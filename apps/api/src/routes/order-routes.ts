import { Router } from 'express';
import {
  createOrderInputSchema,
  orderListQuerySchema,
  orderStatusUpdateSchema,
  type User,
} from '@woo/shared';
import { getAuthenticatedUser, type createRequireAuth } from '../auth/require-auth';
import type { DataSource, OrderCustomer } from '../data-sources/data-source';
import { HttpError, parseIdParam, parseOrThrow } from '../http-error';

function toOrderCustomer(user: User): OrderCustomer {
  const [firstName = user.name, ...lastNameParts] = user.name.split(' ');
  return { firstName, lastName: lastNameParts.join(' '), email: user.email };
}

export function createOrderRoutes(
  dataSource: DataSource,
  requireAuth: ReturnType<typeof createRequireAuth>,
) {
  const router = Router();

  router.get('/', requireAuth('admin'), async (request, response) => {
    const query = parseOrThrow(orderListQuerySchema, request.query);
    response.json(await dataSource.listOrders(query));
  });

  router.get('/mine', requireAuth(), async (_request, response) => {
    const user = getAuthenticatedUser(response);
    response.json(await dataSource.listOrdersByCustomerEmail(user.email));
  });

  router.post('/', requireAuth(), async (request, response) => {
    const input = parseOrThrow(createOrderInputSchema, request.body);
    const customer = toOrderCustomer(getAuthenticatedUser(response));
    response.status(201).json(await dataSource.createOrder(input, customer));
  });

  router.get('/:id', requireAuth(), async (request, response) => {
    const user = getAuthenticatedUser(response);
    const order = await dataSource.getOrder(parseIdParam(request.params.id));
    const canSeeOrder = order && (user.role === 'admin' || order.customer.email === user.email);
    if (!canSeeOrder) throw new HttpError(404, 'Pedido no encontrado');
    response.json(order);
  });

  router.patch('/:id/status', requireAuth('admin'), async (request, response) => {
    const { status } = parseOrThrow(orderStatusUpdateSchema, request.body);
    const order = await dataSource.updateOrderStatus(parseIdParam(request.params.id), status);
    if (!order) throw new HttpError(404, 'Pedido no encontrado');
    response.json(order);
  });

  return router;
}
