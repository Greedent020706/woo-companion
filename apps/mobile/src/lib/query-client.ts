import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@woo/shared';

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);
const MAX_RETRIES = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && NON_RETRYABLE_STATUSES.has(error.status)) &&
        failureCount < MAX_RETRIES,
    },
  },
});

export const queryKeys = {
  categories: ['categories'] as const,
  catalog: (search: string, categoryId: number | undefined) =>
    ['catalog', { search, categoryId }] as const,
  catalogAll: ['catalog'] as const,
  product: (productId: number) => ['product', productId] as const,
  myOrders: (userId: number) => ['my-orders', userId] as const,
};
