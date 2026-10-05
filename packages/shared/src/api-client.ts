import { z } from 'zod';
import { categorySchema } from './schemas/category';
import { loginResponseSchema, userSchema, type LoginInput } from './schemas/auth';
import {
  orderSchema,
  paginatedOrdersSchema,
  type CreateOrderInput,
  type OrderListQuery,
  type OrderStatus,
} from './schemas/order';
import {
  paginatedProductsSchema,
  productSchema,
  type ProductInput,
  type ProductListQuery,
} from './schemas/product';
import { dashboardStatsSchema } from './schemas/stats';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const NETWORK_ERROR_STATUS = 0;

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
  fetchImpl?: typeof fetch;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';
type QueryParams = Record<string, string | number | undefined | null>;

const errorPayloadSchema = z.object({
  message: z.string(),
  details: z.unknown().optional(),
});

export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, String(value));
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  async function request<TSchema extends z.ZodType>(
    path: string,
    responseSchema: TSchema,
    method: HttpMethod = 'GET',
    body?: unknown,
  ): Promise<z.output<TSchema>> {
    const token = (await options.getToken?.()) ?? null;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}/api${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(
        `No se pudo conectar con la API en ${baseUrl}. ¿Está arrancada?`,
        NETWORK_ERROR_STATUS,
      );
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && token) options.onUnauthorized?.();
      const parsedError = errorPayloadSchema.safeParse(payload);
      throw new ApiError(
        parsedError.success ? parsedError.data.message : `Error ${response.status}`,
        response.status,
        parsedError.success ? parsedError.data.details : undefined,
      );
    }

    return responseSchema.parse(payload);
  }

  return {
    login: (credentials: LoginInput) =>
      request('/auth/login', loginResponseSchema, 'POST', credentials),
    getCurrentUser: () => request('/auth/me', userSchema),

    listProducts: (query: ProductListQuery = {}) =>
      request(`/products${buildQueryString(query)}`, paginatedProductsSchema),
    getProduct: (productId: number) => request(`/products/${productId}`, productSchema),
    createProduct: (input: ProductInput) => request('/products', productSchema, 'POST', input),
    updateProduct: (productId: number, input: ProductInput) =>
      request(`/products/${productId}`, productSchema, 'PUT', input),

    listCategories: () => request('/categories', z.array(categorySchema)),

    listOrders: (query: OrderListQuery = {}) =>
      request(`/orders${buildQueryString(query)}`, paginatedOrdersSchema),
    getOrder: (orderId: number) => request(`/orders/${orderId}`, orderSchema),
    updateOrderStatus: (orderId: number, status: OrderStatus) =>
      request(`/orders/${orderId}/status`, orderSchema, 'PATCH', { status }),
    listMyOrders: () => request('/orders/mine', z.array(orderSchema)),
    createOrder: (input: CreateOrderInput) => request('/orders', orderSchema, 'POST', input),

    getStats: () => request('/stats', dashboardStatsSchema),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
