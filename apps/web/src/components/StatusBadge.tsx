import {
  Ban,
  CheckCircle2,
  Clock,
  Loader,
  PauseCircle,
  RotateCcw,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type OrderStatus } from '@woo/shared';
import { ToneBadge } from './ToneBadge';

const ORDER_STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  pending: Clock,
  processing: Loader,
  'on-hold': PauseCircle,
  completed: CheckCircle2,
  cancelled: Ban,
  refunded: RotateCcw,
  failed: XCircle,
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <ToneBadge tone={ORDER_STATUS_TONES[status]} icon={ORDER_STATUS_ICONS[status]}>
      {ORDER_STATUS_LABELS[status]}
    </ToneBadge>
  );
}
