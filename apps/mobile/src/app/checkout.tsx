import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPrice } from '@woo/shared';
import { PrimaryButton } from '../components/PrimaryButton';
import { LoadingState } from '../components/ScreenState';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useMyOrders';
import { getErrorMessage } from '../lib/error-message';
import { notifyOrderPlaced } from '../lib/notifications';
import { colors, radius, shadow, spacing, typography } from '../theme';

export default function CheckoutScreen() {
  const { status, user } = useAuth();
  const { items, total, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const insets = useSafeAreaInsets();

  if (status === 'restoring') return <LoadingState />;
  if (status === 'anonymous') return <Redirect href="/login?redirectTo=checkout" />;
  if (items.length === 0 && !createOrder.isSuccess) return <Redirect href="/cart" />;

  const handleConfirm = () => {
    createOrder.mutate(
      {
        lineItems: items.map(({ productId, quantity }) => ({ productId, quantity })),
      },
      {
        onSuccess: async (order) => {
          clearCart();
          const wasNotified = await notifyOrderPlaced(order).catch(() => false);
          if (!wasNotified) {
            Alert.alert('¡Pedido confirmado!', `Tu pedido #${order.number} se está preparando.`);
          }
          router.dismissTo('/orders');
        },
      },
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={typography.heading}>Resumen</Text>
          {items.map((item) => (
            <View key={item.productId} style={styles.lineItem}>
              <Text style={styles.lineItemName} numberOfLines={1}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={typography.body}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={[styles.lineItem, styles.totalRow]}>
            <Text style={typography.heading}>Total</Text>
            <Text style={styles.total}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={typography.heading}>Datos de envío</Text>
          <Text style={typography.body}>{user?.name}</Text>
          <Text style={typography.caption}>{user?.email}</Text>
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.noticeText}>
            Pago simulado: no se realizará ningún cargo. El pedido se crea en la tienda y recibirás
            una notificación.
          </Text>
        </View>

        {createOrder.isError && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{getErrorMessage(createOrder.error)}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={`Confirmar pedido · ${formatPrice(total)}`}
          icon="checkmark-circle-outline"
          onPress={handleConfirm}
          isLoading={createOrder.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  lineItemName: {
    ...typography.body,
    flex: 1,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  total: {
    ...typography.price,
    fontSize: 20,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
  },
  noticeText: {
    flex: 1,
    color: colors.info,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  actionBar: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
