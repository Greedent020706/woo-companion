import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPrice, type Product } from '@woo/shared';
import { FavoriteButton } from '../../components/FavoriteButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { QuantityStepper } from '../../components/QuantityStepper';
import { ErrorState, LoadingState } from '../../components/ScreenState';
import { StockPill } from '../../components/StockPill';
import { useCart } from '../../hooks/useCart';
import { useProduct } from '../../hooks/useCatalog';
import { colors, radius, spacing, typography } from '../../theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productQuery = useProduct(Number(id));

  if (productQuery.isPending) return <LoadingState label="Cargando producto…" />;
  if (productQuery.isError) {
    return <ErrorState error={productQuery.error} onRetry={() => productQuery.refetch()} />;
  }
  return <ProductDetail product={productQuery.data} />;
}

function ProductDetail({ product }: { product: Product }) {
  const { addToCart, items } = useCart();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [wasJustAdded, setWasJustAdded] = useState(false);

  const quantityInCart = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const isOutOfStock = product.stockStatus === 'outofstock';
  const remainingStock =
    product.stockQuantity === null ? undefined : product.stockQuantity - quantityInCart;
  const canAddToCart = !isOutOfStock && (remainingStock === undefined || remainingStock > 0);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
    setWasJustAdded(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => <FavoriteButton product={product} />,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.image} />
        )}

        <View style={styles.details}>
          <Text style={typography.caption}>
            {product.categories.map((category) => category.name).join(' · ')}
          </Text>
          <Text style={typography.title}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.salePrice !== null && (
              <Text style={styles.regularPrice}>{formatPrice(product.regularPrice)}</Text>
            )}
            <StockPill stockStatus={product.stockStatus} stockQuantity={product.stockQuantity} />
          </View>

          {product.shortDescription !== '' && (
            <Text style={styles.lead}>{product.shortDescription}</Text>
          )}
          <Text style={typography.body}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {wasJustAdded && (
          <View style={styles.addedRow} accessibilityLiveRegion="polite">
            <Text style={styles.addedText}>Añadido al carrito ({quantityInCart} en total)</Text>
            <Text style={styles.addedLink} onPress={() => router.navigate('/cart')}>
              Ver carrito
            </Text>
          </View>
        )}
        <View style={styles.actionRow}>
          {canAddToCart && (
            <QuantityStepper
              quantity={quantity}
              min={1}
              max={remainingStock}
              onChange={setQuantity}
              itemName={product.name}
            />
          )}
          <View style={styles.actionButton}>
            <PrimaryButton
              label={canAddToCart ? 'Añadir' : isOutOfStock ? 'Agotado' : 'Sin más stock'}
              icon="bag-add-outline"
              disabled={!canAddToCart}
              onPress={handleAddToCart}
            />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
  },
  details: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    ...typography.price,
    fontSize: 24,
  },
  regularPrice: {
    ...typography.caption,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  lead: {
    ...typography.body,
    fontWeight: '600',
  },
  actionBar: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  addedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.successSoft,
  },
  addedText: {
    color: colors.success,
    fontWeight: '600',
  },
  addedLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
