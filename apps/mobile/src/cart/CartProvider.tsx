import { createContext, useMemo, useReducer, type ReactNode } from 'react';
import type { Product } from '@woo/shared';
import {
  cartReducer,
  getCartItemCount,
  getCartTotal,
  initialCartState,
  type CartItem,
} from './cart-reducer';

export type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  const value = useMemo<CartContextValue>(
    () => ({
      items: cartState.items,
      itemCount: getCartItemCount(cartState),
      total: getCartTotal(cartState),
      addToCart: (product, quantity = 1) => dispatch({ type: 'add', product, quantity }),
      setQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
      removeFromCart: (productId) => dispatch({ type: 'remove', productId }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [cartState],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
