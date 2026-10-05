import type { OrderStatus } from './schemas/order';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente de pago',
  processing: 'Procesando',
  'on-hold': 'En espera',
  completed: 'Completado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  failed: 'Fallido',
};

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  pending: 'warning',
  processing: 'info',
  'on-hold': 'warning',
  completed: 'success',
  cancelled: 'neutral',
  refunded: 'neutral',
  failed: 'danger',
};
