import { router } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { formatPrice } from '@woo/shared';
import { PrimaryButton } from '../../components/PrimaryButton';
import { QuantityStepper } from '../../components/QuantityStepper';
import { EmptyState } from '../../components/ScreenState';
import { useCart } from '../../hooks/useCart';
import { colors, radius, shadow, spacing, typography } from '../../theme';

export default function CartScreen() {
  const { items, itemCount, total, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bag-outline"
        title="Tu carrito está vacío"
        description="Añade productos desde el catálogo."
        action={
          <PrimaryButton
            label="Ver catálogo"
            icon="storefront-outline"
            onPress={() => router.navigate('/')}
          />
        }
      />
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.productId)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnail} />
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={typography.caption}>{formatPrice(item.price)} / ud.</Text>
              <View style={styles.rowFooter}>
                <QuantityStepper
                  quantity={item.quantity}
                  max={item.maxQuantity ?? undefined}
                  onChange={(quantity) => setQuantity(item.productId, quantity)}
                  itemName={item.name}
                />
                <Text style={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={typography.body}>
            Total ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})
          </Text>
          <Text style={styles.total}>{formatPrice(total)}</Text>
        </View>
        <PrimaryButton
          label="Finalizar compra"
          icon="card-outline"
          onPress={() => router.push('/checkout')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  lineTotal: {
    ...typography.price,
    fontSize: 15,
  },
  summary: {
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    ...typography.price,
    fontSize: 20,
  },
});
