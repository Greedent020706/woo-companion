import type { Product } from '@woo/shared';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number | null;
};

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: 'add'; product: Product; quantity: number }
  | { type: 'setQuantity'; productId: number; quantity: number }
  | { type: 'remove'; productId: number }
  | { type: 'clear' };

export const MAX_QUANTITY_PER_ITEM = 99;

export const initialCartState: CartState = { items: [] };

function clampQuantity(quantity: number, maxQuantity: number | null): number {
  const upperLimit = Math.min(maxQuantity ?? MAX_QUANTITY_PER_ITEM, MAX_QUANTITY_PER_ITEM);
  return Math.max(0, Math.min(quantity, upperLimit));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const { product, quantity } = action;
      const existingItem = state.items.find((item) => item.productId === product.id);
      if (existingItem) {
        return cartReducer(state, {
          type: 'setQuantity',
          productId: product.id,
          quantity: existingItem.quantity + quantity,
        });
      }
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        maxQuantity: product.stockQuantity,
        quantity: clampQuantity(quantity, product.stockQuantity),
      };
      return newItem.quantity > 0 ? { items: [...state.items, newItem] } : state;
    }
    case 'setQuantity': {
      const items = state.items
        .map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: clampQuantity(action.quantity, item.maxQuantity) }
            : item,
        )
        .filter((item) => item.quantity > 0);
      return { items };
    }
    case 'remove':
      return { items: state.items.filter((item) => item.productId !== action.productId) };
    case 'clear':
      return initialCartState;
  }
}

export function getCartItemCount(state: CartState): number {
  return state.items.reduce((count, item) => count + item.quantity, 0);
}

export function getCartTotal(state: CartState): number {
  const totalInCents = state.items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  );
  return totalInCents / 100;
}
