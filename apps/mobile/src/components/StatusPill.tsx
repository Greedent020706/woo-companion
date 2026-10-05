import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  type OrderStatus,
  type StatusTone,
} from '@woo/shared';
import { colors, radius, spacing } from '../theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TONE_COLORS: Record<StatusTone, { background: string; foreground: string }> = {
  success: { background: colors.successSoft, foreground: colors.success },
  warning: { background: colors.warningSoft, foreground: colors.warning },
  danger: { background: colors.dangerSoft, foreground: colors.danger },
  info: { background: colors.infoSoft, foreground: colors.info },
  neutral: { background: colors.neutralSoft, foreground: colors.neutral },
};

const ORDER_STATUS_ICONS: Record<OrderStatus, IoniconName> = {
  pending: 'time-outline',
  processing: 'sync-outline',
  'on-hold': 'pause-circle-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'ban-outline',
  refunded: 'return-up-back-outline',
  failed: 'close-circle-outline',
};

type TonePillProps = { tone: StatusTone; icon: IoniconName; label: string };

export function TonePill({ tone, icon, label }: TonePillProps) {
  const { background, foreground } = TONE_COLORS[tone];
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Ionicons name={icon} size={14} color={foreground} />
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>
  );
}

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <TonePill
      tone={ORDER_STATUS_TONES[status]}
      icon={ORDER_STATUS_ICONS[status]}
      label={ORDER_STATUS_LABELS[status]}
    />
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
