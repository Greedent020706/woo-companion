import { describe, expect, it } from 'vitest';
import { mapWooOrder, mapWooProduct, stripHtml, toWooProductPayload } from './woo-mappers';
import type { WooOrder, WooProduct } from './woo-types';

const wooProduct: WooProduct = {
  id: 7,
  name: 'Caf&eacute; &amp; t&eacute;',
  slug: 'cafe-te',
  sku: 'CT-1',
  status: 'publish',
  date_created_gmt: '2026-09-01T10:00:00',
  price: '9.50',
  regular_price: '12.00',
  sale_price: '9.50',
  stock_status: 'instock',
  stock_quantity: 3,
  manage_stock: true,
  categories: [{ id: 2, name: 'Bebidas', slug: 'bebidas' }],
  images: [{ src: 'https://shop.test/cafe.jpg' }],
  short_description: '<p>Rico <strong>y</strong> suave</p>',
  description: '',
};

describe('woo mappers', () => {
  it('strips tags and decodes common entities', () => {
    expect(stripHtml('<p>Hola&nbsp;<b>mundo</b> &amp; más</p>')).toBe('Hola mundo & más');
  });

  it('maps a WooCommerce product to the shared Product shape', () => {
    expect(mapWooProduct(wooProduct)).toMatchObject({
      id: 7,
      price: 9.5,
      regularPrice: 12,
      salePrice: 9.5,
      stockQuantity: 3,
      imageUrl: 'https://shop.test/cafe.jpg',
      shortDescription: 'Rico y suave',
      createdAt: '2026-09-01T10:00:00Z',
    });
  });

  it('treats an empty sale price and unmanaged stock as null', () => {
    const product = mapWooProduct({ ...wooProduct, sale_price: '', manage_stock: false });
    expect(product.salePrice).toBeNull();
    expect(product.stockQuantity).toBeNull();
  });

  it('falls back to pending for unknown order statuses', () => {
    const wooOrder: WooOrder = {
      id: 1,
      number: '1',
      status: 'checkout-draft',
      currency: 'EUR',
      total: '10.00',
      date_created_gmt: '2026-09-01T10:00:00',
      billing: { first_name: 'Ana', last_name: 'Ruiz', email: 'ana@test.com' },
      line_items: [{ product_id: 7, name: 'Café', quantity: 1, price: 10, total: '10.00' }],
    };
    expect(mapWooOrder(wooOrder)).toMatchObject({ status: 'pending', total: 10 });
  });

  it('builds the payload WooCommerce expects when saving a product', () => {
    const payload = toWooProductPayload({
      name: 'Nuevo',
      sku: 'N-1',
      status: 'draft',
      regularPrice: 10,
      salePrice: null,
      stockQuantity: null,
      categoryIds: [2],
      imageUrl: '',
      shortDescription: '',
      description: '',
    });
    expect(payload).toMatchObject({
      regular_price: '10.00',
      sale_price: '',
      manage_stock: false,
      categories: [{ id: 2 }],
      images: [],
    });
  });
});
