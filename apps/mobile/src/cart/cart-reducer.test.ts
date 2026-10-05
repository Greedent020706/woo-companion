import { describe, expect, it } from 'vitest';
import type { Product } from '@woo/shared';
import {
  cartReducer,
  getCartItemCount,
  getCartTotal,
  initialCartState,
  type CartState,
} from './cart-reducer';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Café',
    slug: 'cafe',
    sku: 'C-1',
    status: 'publish',
    price: 12.9,
    regularPrice: 12.9,
    salePrice: null,
    stockStatus: 'instock',
    stockQuantity: 5,
    categories: [],
    imageUrl: null,
    shortDescription: '',
    description: '',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('cartReducer', () => {
  it('adds a new product and merges quantities when added again', () => {
    const product = buildProduct();
    const afterFirstAdd = cartReducer(initialCartState, { type: 'add', product, quantity: 1 });
    const afterSecondAdd = cartReducer(afterFirstAdd, { type: 'add', product, quantity: 2 });

    expect(afterSecondAdd.items).toHaveLength(1);
    expect(afterSecondAdd.items[0]?.quantity).toBe(3);
  });

  it('never exceeds the available stock', () => {
    const product = buildProduct({ stockQuantity: 2 });
    const state = cartReducer(initialCartState, { type: 'add', product, quantity: 10 });
    expect(state.items[0]?.quantity).toBe(2);
  });

  it('removes the item when its quantity drops to zero', () => {
    const state = cartReducer(initialCartState, {
      type: 'add',
      product: buildProduct(),
      quantity: 1,
    });
    const updated = cartReducer(state, { type: 'setQuantity', productId: 1, quantity: 0 });
    expect(updated.items).toEqual([]);
  });

  it('does not mutate the previous state', () => {
    const state = cartReducer(initialCartState, {
      type: 'add',
      product: buildProduct(),
      quantity: 1,
    });
    const snapshot = structuredClone(state);
    cartReducer(state, { type: 'setQuantity', productId: 1, quantity: 4 });
    expect(state).toEqual(snapshot);
  });

  it('computes count and total without floating point drift', () => {
    const state: CartState = {
      items: [
        { productId: 1, name: 'A', price: 0.1, imageUrl: null, quantity: 3, maxQuantity: null },
        { productId: 2, name: 'B', price: 0.2, imageUrl: null, quantity: 1, maxQuantity: null },
      ],
    };
    expect(getCartItemCount(state)).toBe(4);
    expect(getCartTotal(state)).toBe(0.5);
  });
});
