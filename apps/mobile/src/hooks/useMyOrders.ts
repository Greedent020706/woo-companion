import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrderInput } from '@woo/shared';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import { useAuth } from './useAuth';

export function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.myOrders(user?.id ?? 0),
    queryFn: api.listMyOrders,
    enabled: user !== null,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.createOrder(input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myOrders(user?.id ?? 0) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogAll }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
      ]),
  });
}
