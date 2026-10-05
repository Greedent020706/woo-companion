import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductInput, ProductListQuery } from '@woo/shared';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export function useProducts(query: ProductListQuery) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => api.listProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(productId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId ?? 0),
    queryFn: () => api.getProduct(productId!),
    enabled: productId !== undefined,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.listCategories,
    staleTime: 5 * 60_000,
  });
}

export function useSaveProduct(productId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      productId === undefined ? api.createProduct(input) : api.updateProduct(productId, input),
    onSuccess: (savedProduct) => {
      queryClient.setQueryData(queryKeys.products.detail(savedProduct.id), savedProduct);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ]);
    },
  });
}
