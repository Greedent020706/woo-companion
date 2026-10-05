import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@woo/shared';

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);
const MAX_RETRIES = 2;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && NON_RETRYABLE_STATUSES.has(error.status)) &&
          failureCount < MAX_RETRIES,
      },
    },
  });
}
