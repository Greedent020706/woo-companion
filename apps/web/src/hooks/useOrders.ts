import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderListQuery, OrderStatus } from '@woo/shared';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export function useOrders(query: OrderListQuery) {
  return useQuery({
    queryKey: queryKeys.orders.list(query),
    queryFn: () => api.listOrders(query),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(orderId: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => api.getOrder(orderId),
  });
}

export function useUpdateOrderStatus(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: OrderStatus) => api.updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(orderId), updatedOrder);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ]);
    },
  });
}

export function useDashboardStats() {
  return useQuery({ queryKey: queryKeys.stats, queryFn: api.getStats });
}
