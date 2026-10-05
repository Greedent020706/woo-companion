import { Link } from 'expo-router';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPrice, type Product } from '@woo/shared';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { FavoriteButton } from './FavoriteButton';

function ProductCardComponent({ product }: { product: Product }) {
  const isOutOfStock = product.stockStatus === 'outofstock';

  return (
    <View style={styles.card}>
      <Link href={`/product/${product.id}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${formatPrice(product.price)}${isOutOfStock ? ', agotado' : ''}`}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <View style={styles.imageWrapper}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.image} />
            )}
            {isOutOfStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Agotado</Text>
              </View>
            )}
          </View>
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.salePrice !== null && (
                <Text style={styles.regularPrice}>{formatPrice(product.regularPrice)}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </Link>
      <View style={styles.favoritePosition}>
        <FavoriteButton product={product} size={18} />
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadow,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrapper: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceMuted,
  },
  outOfStockBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    ...typography.price,
    fontSize: 16,
  },
  regularPrice: {
    ...typography.caption,
    textDecorationLine: 'line-through',
  },
  favoritePosition: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
});
