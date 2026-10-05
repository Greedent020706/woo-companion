import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { formatDate, formatPrice, type Order } from '@woo/shared';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState, ErrorState, LoadingState } from '../../components/ScreenState';
import { OrderStatusPill } from '../../components/StatusPill';
import { useAuth } from '../../hooks/useAuth';
import { useMyOrders } from '../../hooks/useMyOrders';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { colors, radius, shadow, spacing, typography } from '../../theme';

export default function OrdersScreen() {
  const { status } = useAuth();

  if (status === 'restoring') return <LoadingState />;

  if (status === 'anonymous') {
    return (
      <EmptyState
        icon="lock-closed-outline"
        title="Inicia sesión para ver tus pedidos"
        description="Tus pedidos están asociados a tu cuenta."
        action={
          <PrimaryButton
            label="Iniciar sesión"
            icon="log-in-outline"
            onPress={() => router.push('/login')}
          />
        }
      />
    );
  }

  return <MyOrdersList />;
}

function MyOrdersList() {
  const { user, logout } = useAuth();
  const ordersQuery = useMyOrders();
  const { isRefreshing, onRefresh } = usePullToRefresh(ordersQuery.refetch);

  if (ordersQuery.isPending) return <LoadingState label="Cargando pedidos…" />;
  if (ordersQuery.isError) {
    return <ErrorState error={ordersQuery.error} onRetry={() => ordersQuery.refetch()} />;
  }

  return (
    <FlatList
      data={ordersQuery.data}
      keyExtractor={(order) => String(order.id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <View style={styles.accountRow}>
          <Text style={typography.caption}>Sesión iniciada como {user?.email}</Text>
          <Pressable onPress={logout} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.logout}>Cerrar sesión</Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="receipt-outline"
          title="Todavía no has hecho pedidos"
          description="Cuando completes una compra aparecerá aquí."
        />
      }
      renderItem={({ item }) => <OrderCard order={item} />}
    />
  );
}

function OrderCard({ order }: { order: Order }) {
  const itemsSummary = order.lineItems
    .map((lineItem) => `${lineItem.quantity}× ${lineItem.name}`)
    .join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={typography.heading}>Pedido #{order.number}</Text>
        <OrderStatusPill status={order.status} />
      </View>
      <Text style={typography.caption}>{formatDate(order.createdAt)}</Text>
      <Text style={typography.body} numberOfLines={2}>
        {itemsSummary}
      </Text>
      <Text style={styles.total}>{formatPrice(order.total, order.currency)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  logout: {
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  total: {
    ...typography.price,
    alignSelf: 'flex-end',
  },
});
