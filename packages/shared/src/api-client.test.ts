import { describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_STATUS, buildQueryString, createApiClient } from './api-client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const demoUser = { id: 1, email: 'admin@demo.com', name: 'Admin Demo', role: 'admin' };

describe('buildQueryString', () => {
  it('omits empty values and encodes the rest', () => {
    expect(
      buildQueryString({ search: 'café negro', page: 2, category: undefined, status: '' }),
    ).toBe('?search=caf%C3%A9+negro&page=2');
  });

  it('returns an empty string when there are no params', () => {
    expect(buildQueryString({})).toBe('');
  });
});

describe('createApiClient', () => {
  it('sends the token and parses a valid response', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(demoUser));
    const client = createApiClient({
      baseUrl: 'http://api.test/',
      getToken: () => 'secret-token',
      fetchImpl,
    });

    const user = await client.getCurrentUser();

    expect(user).toEqual(demoUser);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://api.test/api/auth/me');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer secret-token' });
  });

  it('serialises the body as JSON on POST requests', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ token: 'jwt', user: demoUser }));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await client.login({ email: 'admin@demo.com', password: 'demo1234' });

    const [, init] = fetchImpl.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ email: 'admin@demo.com', password: 'demo1234' }));
  });

  it('throws an ApiError with the server message on error responses', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ message: 'Producto no encontrado' }, 404));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await expect(client.getProduct(999)).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Producto no encontrado',
    });
  });

  it('calls onUnauthorized when an authenticated request returns 401', async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ message: 'Token caducado' }, 401));
    const client = createApiClient({
      baseUrl: 'http://api.test',
      getToken: () => 'expired',
      onUnauthorized,
      fetchImpl,
    });

    await expect(client.getStats()).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('wraps network failures in an ApiError with status 0', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed'));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await expect(client.listCategories()).rejects.toMatchObject({ status: NETWORK_ERROR_STATUS });
  });

  it('rejects responses that do not match the schema', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: 'not-a-number' }));
    const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl });

    await expect(client.getCurrentUser()).rejects.toThrow();
  });
});
