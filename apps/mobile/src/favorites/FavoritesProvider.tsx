import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { z } from 'zod';
import type { Product } from '@woo/shared';

const FAVORITES_KEY = 'woo-companion.favorites';

const favoriteSchema = z.object({
  productId: z.number(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().nullable(),
});

export type Favorite = z.infer<typeof favoriteSchema>;

export type FavoritesContextValue = {
  favorites: Favorite[];
  isLoaded: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>) => void;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

async function readStoredFavorites(): Promise<Favorite[]> {
  const rawFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!rawFavorites) return [];
  const parsedFavorites = z.array(favoriteSchema).safeParse(JSON.parse(rawFavorites));
  return parsedFavorites.success ? parsedFavorites.data : [];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    readStoredFavorites()
      .catch(() => [])
      .then((storedFavorites) => {
        setFavorites(storedFavorites);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch((error: unknown) =>
      console.warn('No se pudieron guardar los favoritos', error),
    );
  }, [favorites, isLoaded]);

  const toggleFavorite = useCallback<FavoritesContextValue['toggleFavorite']>((product) => {
    setFavorites((currentFavorites) =>
      currentFavorites.some((favorite) => favorite.productId === product.id)
        ? currentFavorites.filter((favorite) => favorite.productId !== product.id)
        : [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
            },
            ...currentFavorites,
          ],
    );
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isLoaded,
      isFavorite: (productId) => favorites.some((favorite) => favorite.productId === productId),
      toggleFavorite,
    }),
    [favorites, isLoaded, toggleFavorite],
  );

  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}
