import cors from 'cors';
import express from 'express';
import { createRequireAuth } from './auth/require-auth';
import type { DataSource } from './data-sources/data-source';
import { errorHandler, notFoundHandler } from './http-error';
import { createAuthRoutes } from './routes/auth-routes';
import { createOrderRoutes } from './routes/order-routes';
import { createProductRoutes } from './routes/product-routes';

export type AppOptions = {
  dataSource: DataSource;
  dataSourceName: string;
  jwtSecret: string;
  corsOrigins: string[];
};

export function createApp({ dataSource, dataSourceName, jwtSecret, corsOrigins }: AppOptions) {
  const app = express();
  const requireAuth = createRequireAuth(jwtSecret);

  app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', dataSource: dataSourceName });
  });

  app.use('/api/auth', createAuthRoutes(jwtSecret, requireAuth));
  app.use('/api/products', createProductRoutes(dataSource, requireAuth));
  app.use('/api/orders', createOrderRoutes(dataSource, requireAuth));

  app.get('/api/categories', async (_request, response) => {
    response.json(await dataSource.listCategories());
  });

  app.get('/api/stats', requireAuth('admin'), async (_request, response) => {
    response.json(await dataSource.getStats());
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
