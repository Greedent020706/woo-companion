import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './create-app';
import { MockDataSource } from './data-sources/mock-data-source';

function createTestApp() {
  return createApp({
    dataSource: new MockDataSource(),
    dataSourceName: 'mock',
    jwtSecret: 'test-secret-with-enough-length',
    corsOrigins: ['*'],
  });
}

async function loginAs(app: ReturnType<typeof createTestApp>, email: string) {
  const response = await request(app).post('/api/auth/login').send({ email, password: 'demo1234' });
  return response.body.token as string;
}

describe('API in mock mode', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  it('rejects wrong credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'wrong' });
    expect(response.status).toBe(401);
  });

  it('lists products with search and pagination', async () => {
    const response = await request(app).get('/api/products?search=cafe&perPage=5');
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeLessThanOrEqual(5);
    expect(response.body.total).toBeGreaterThan(0);
  });

  it('protects admin endpoints', async () => {
    expect((await request(app).get('/api/stats')).status).toBe(401);

    const customerToken = await loginAs(app, 'cliente@demo.com');
    const forbidden = await request(app).get('/api/stats').auth(customerToken, { type: 'bearer' });
    expect(forbidden.status).toBe(403);

    const adminToken = await loginAs(app, 'admin@demo.com');
    const allowed = await request(app).get('/api/stats').auth(adminToken, { type: 'bearer' });
    expect(allowed.status).toBe(200);
    expect(allowed.body.productsCount).toBe(30);
  });

  it('validates product input and returns field errors', async () => {
    const adminToken = await loginAs(app, 'admin@demo.com');
    const response = await request(app)
      .post('/api/products')
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'x' });
    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
    );
  });

  it('creates an order for the logged-in customer and lists it in /orders/mine', async () => {
    const customerToken = await loginAs(app, 'cliente@demo.com');
    const created = await request(app)
      .post('/api/orders')
      .auth(customerToken, { type: 'bearer' })
      .send({ lineItems: [{ productId: 101, quantity: 2 }] });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'processing', total: 29 });

    const mine = await request(app).get('/api/orders/mine').auth(customerToken, { type: 'bearer' });
    expect(mine.body[0].id).toBe(created.body.id);
  });

  it('refuses to sell an out-of-stock product', async () => {
    const customerToken = await loginAs(app, 'cliente@demo.com');
    const response = await request(app)
      .post('/api/orders')
      .auth(customerToken, { type: 'bearer' })
      .send({ lineItems: [{ productId: 105, quantity: 1 }] });
    expect(response.status).toBe(409);
  });
});
