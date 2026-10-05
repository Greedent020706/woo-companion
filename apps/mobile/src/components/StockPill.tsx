import type { Product } from '@woo/shared';
import { TonePill } from './StatusPill';

const LOW_STOCK_THRESHOLD = 5;

export function StockPill({
  stockStatus,
  stockQuantity,
}: Pick<Product, 'stockStatus' | 'stockQuantity'>) {
  if (stockStatus === 'outofstock') {
    return <TonePill tone="danger" icon="close-circle-outline" label="Agotado" />;
  }
  if (stockStatus === 'onbackorder') {
    return <TonePill tone="info" icon="time-outline" label="Bajo pedido" />;
  }
  if (stockQuantity !== null && stockQuantity <= LOW_STOCK_THRESHOLD) {
    return (
      <TonePill tone="warning" icon="alert-circle-outline" label={`Quedan ${stockQuantity}`} />
    );
  }
  return <TonePill tone="success" icon="checkmark-circle-outline" label="En stock" />;
}
