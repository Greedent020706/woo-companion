import { Link, router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPrice } from '@woo/shared';
import { FavoriteButton } from '../../components/FavoriteButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState, LoadingState } from '../../components/ScreenState';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, radius, shadow, spacing, typography } from '../../theme';

export default function FavoritesScreen() {
  const { favorites, isLoaded } = useFavorites();

  if (!isLoaded) return <LoadingState />;

  return (
    <FlatList
      data={favorites}
      keyExtractor={(favorite) => String(favorite.productId)}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="Aún no tienes favoritos"
          description="Pulsa el corazón de un producto para guardarlo aquí. Se conservan aunque cierres la app."
          action={
            <PrimaryButton
              label="Ver catálogo"
              icon="storefront-outline"
              onPress={() => router.navigate('/')}
            />
          }
        />
      }
      renderItem={({ item: favorite }) => (
        <View style={styles.row}>
          <Link href={`/product/${favorite.productId}`} asChild>
            <Pressable style={styles.rowLink} accessibilityRole="button">
              {favorite.imageUrl ? (
                <Image source={{ uri: favorite.imageUrl }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnail} />
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {favorite.name}
                </Text>
                <Text style={styles.price}>{formatPrice(favorite.price)}</Text>
              </View>
            </Pressable>
          </Link>
          <FavoriteButton
            product={{
              id: favorite.productId,
              name: favorite.name,
              price: favorite.price,
              imageUrl: favorite.imageUrl,
            }}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow,
  },
  rowLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumbnail: {
    width: 64,
    height: 64,
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
  price: {
    ...typography.price,
    fontSize: 15,
  },
});
