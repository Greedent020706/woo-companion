import { use } from 'react';
import { CartContext } from '../cart/CartProvider';

export function useCart() {
  const cart = use(CartContext);
  if (!cart) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return cart;
}
