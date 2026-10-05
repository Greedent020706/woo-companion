import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';

const CATALOG_PAGE_SIZE = 10;

export function useCatalog(search: string, categoryId: number | undefined) {
  const catalogQuery = useInfiniteQuery({
    queryKey: queryKeys.catalog(search, categoryId),
    queryFn: ({ pageParam }) =>
      api.listProducts({
        search: search || undefined,
        category: categoryId,
        status: 'publish',
        page: pageParam,
        perPage: CATALOG_PAGE_SIZE,
      }),
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const products = catalogQuery.data?.pages.flatMap((page) => page.items) ?? [];
  return { ...catalogQuery, products };
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.listCategories,
    staleTime: 5 * 60_000,
  });
}

export function useProduct(productId: number) {
  return useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => api.getProduct(productId),
    enabled: Number.isInteger(productId),
  });
}
