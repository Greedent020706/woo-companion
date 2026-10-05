import { use } from 'react';
import { FavoritesContext } from '../favorites/FavoritesProvider';

export function useFavorites() {
  const favorites = use(FavoritesContext);
  if (!favorites) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  return favorites;
}
