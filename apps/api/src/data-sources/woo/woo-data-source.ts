import type {
  CreateOrderInput,
  OrderStatus,
  ParsedOrderListQuery,
  ParsedProductListQuery,
  ProductInput,
} from '@woo/shared';
import { HttpError } from '../../http-error';
import type { DataSource, OrderCustomer } from '../data-source';
import { buildDashboardStats } from '../helpers';
import { createWooClient, type WooClientOptions, type WooRequest } from './woo-client';
import { mapWooCategory, mapWooOrder, mapWooProduct, toWooProductPayload } from './woo-mappers';
import type { WooCategory, WooOrder, WooProduct } from './woo-types';

const WOO_MAX_PER_PAGE = 100;

async function nullWhenNotFound<TResult>(promise: Promise<TResult>): Promise<TResult | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}

export class WooDataSource implements DataSource {
  private readonly wooRequest: WooRequest;

  constructor(options: WooClientOptions) {
    this.wooRequest = createWooClient(options);
  }

  async listProducts({ search, category, status, page, perPage }: ParsedProductListQuery) {
    const response = await this.wooRequest<WooProduct[]>('/products', {
      query: { search, category, status, page, per_page: perPage },
    });
    return {
      items: response.data.map(mapWooProduct),
      total: response.total,
      page,
      perPage,
      totalPages: response.totalPages,
    };
  }

  async getProduct(productId: number) {
    return nullWhenNotFound(
      this.wooRequest<WooProduct>(`/products/${productId}`).then(({ data }) => mapWooProduct(data)),
    );
  }

  async createProduct(input: ProductInput) {
    const { data } = await this.wooRequest<WooProduct>('/products', {
      method: 'POST',
      body: toWooProductPayload(input),
    });
    return mapWooProduct(data);
  }

  async updateProduct(productId: number, input: ProductInput) {
    return nullWhenNotFound(
      this.wooRequest<WooProduct>(`/products/${productId}`, {
        method: 'PUT',
        body: toWooProductPayload(input),
      }).then(({ data }) => mapWooProduct(data)),
    );
  }

  async listCategories() {
    const { data } = await this.wooRequest<WooCategory[]>('/products/categories', {
      query: { per_page: WOO_MAX_PER_PAGE, hide_empty: 'false' },
    });
    return data.map(mapWooCategory);
  }

  async listOrders({ status, search, page, perPage }: ParsedOrderListQuery) {
    const response = await this.wooRequest<WooOrder[]>('/orders', {
      query: { status, search, page, per_page: perPage },
    });
    return {
      items: response.data.map(mapWooOrder),
      total: response.total,
      page,
      perPage,
      totalPages: response.totalPages,
    };
  }

  async listOrdersByCustomerEmail(email: string) {
    const { data } = await this.wooRequest<WooOrder[]>('/orders', {
      query: { search: email, per_page: WOO_MAX_PER_PAGE },
    });
    return data
      .map(mapWooOrder)
      .filter((order) => order.customer.email.toLowerCase() === email.toLowerCase());
  }

  async getOrder(orderId: number) {
    return nullWhenNotFound(
      this.wooRequest<WooOrder>(`/orders/${orderId}`).then(({ data }) => mapWooOrder(data)),
    );
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    return nullWhenNotFound(
      this.wooRequest<WooOrder>(`/orders/${orderId}`, { method: 'PUT', body: { status } }).then(
        ({ data }) => mapWooOrder(data),
      ),
    );
  }

  async createOrder(input: CreateOrderInput, customer: OrderCustomer) {
    const { data } = await this.wooRequest<WooOrder>('/orders', {
      method: 'POST',
      body: {
        status: 'processing',
        set_paid: true,
        payment_method_title: 'Pago simulado (woo-companion)',
        billing: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
        },
        line_items: input.lineItems.map(({ productId, quantity }) => ({
          product_id: productId,
          quantity,
        })),
      },
    });
    return mapWooOrder(data);
  }

  async getStats() {
    // Aproximación: el dashboard usa los 100 productos y pedidos más recientes
    const [productsResponse, ordersResponse] = await Promise.all([
      this.wooRequest<WooProduct[]>('/products', { query: { per_page: WOO_MAX_PER_PAGE } }),
      this.wooRequest<WooOrder[]>('/orders', { query: { per_page: WOO_MAX_PER_PAGE } }),
    ]);
    const stats = buildDashboardStats(
      productsResponse.data.map(mapWooProduct),
      ordersResponse.data.map(mapWooOrder),
    );
    return {
      ...stats,
      productsCount: productsResponse.total || stats.productsCount,
      ordersCount: ordersResponse.total || stats.ordersCount,
    };
  }
}
