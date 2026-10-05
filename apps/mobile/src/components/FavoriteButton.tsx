import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';
import type { Product } from '@woo/shared';
import { useFavorites } from '../hooks/useFavorites';
import { colors, radius, shadow } from '../theme';

type FavoriteButtonProps = {
  product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>;
  size?: number;
};

export function FavoriteButton({ product, size = 20 }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isSaved = isFavorite(product.id);

  return (
    <Pressable
      onPress={() => toggleFavorite(product)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        isSaved ? `Quitar ${product.name} de favoritos` : `Añadir ${product.name} a favoritos`
      }
      accessibilityState={{ selected: isSaved }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={isSaved ? 'heart' : 'heart-outline'}
        size={size}
        color={isSaved ? colors.favorite : colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow,
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
