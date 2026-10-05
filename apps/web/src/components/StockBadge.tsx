import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Product } from '@woo/shared';
import { ToneBadge } from './ToneBadge';

export const LOW_STOCK_THRESHOLD = 5;

type StockBadgeProps = Pick<Product, 'stockStatus' | 'stockQuantity'>;

export function StockBadge({ stockStatus, stockQuantity }: StockBadgeProps) {
  if (stockStatus === 'outofstock') {
    return (
      <ToneBadge tone="danger" icon={XCircle}>
        Agotado
      </ToneBadge>
    );
  }
  if (stockStatus === 'onbackorder') {
    return (
      <ToneBadge tone="info" icon={Clock}>
        Bajo pedido
      </ToneBadge>
    );
  }
  if (stockQuantity !== null && stockQuantity <= LOW_STOCK_THRESHOLD) {
    return (
      <ToneBadge tone="warning" icon={AlertTriangle}>
        Quedan {stockQuantity}
      </ToneBadge>
    );
  }
  return (
    <ToneBadge tone="success" icon={CheckCircle2}>
      {stockQuantity === null ? 'Disponible' : `En stock (${stockQuantity})`}
    </ToneBadge>
  );
}
