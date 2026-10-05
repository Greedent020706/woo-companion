import type { OrderListQuery, ProductListQuery } from '@woo/shared';

export const queryKeys = {
  stats: ['stats'] as const,
  categories: ['categories'] as const,
  products: {
    all: ['products'] as const,
    list: (query: ProductListQuery) => ['products', 'list', query] as const,
    detail: (productId: number) => ['products', 'detail', productId] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (query: OrderListQuery) => ['orders', 'list', query] as const,
    detail: (orderId: number) => ['orders', 'detail', orderId] as const,
  },
};
