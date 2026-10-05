import { describe, expect, it, vi } from 'vitest';
import { WooDataSource } from './woo-data-source';
import type { WooProduct } from './woo-types';

const wooProduct: WooProduct = {
  id: 7,
  name: 'Café',
  slug: 'cafe',
  sku: 'C-7',
  status: 'publish',
  date_created_gmt: '2026-09-01T10:00:00',
  price: '9.50',
  regular_price: '9.50',
  sale_price: '',
  stock_status: 'instock',
  stock_quantity: null,
  manage_stock: false,
  categories: [],
  images: [],
  short_description: '',
  description: '',
};

function createDataSource(response: Response) {
  const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response);
  const dataSource = new WooDataSource({
    url: 'https://shop.test/',
    key: 'ck_test',
    secret: 'cs_test',
    fetchImpl,
  });
  return { dataSource, fetchImpl };
}

describe('WooDataSource', () => {
  it('calls the WooCommerce REST API with Basic auth and reads pagination headers', async () => {
    const { dataSource, fetchImpl } = createDataSource(
      new Response(JSON.stringify([wooProduct]), {
        headers: { 'X-WP-Total': '21', 'X-WP-TotalPages': '3' },
      }),
    );

    const result = await dataSource.listProducts({ page: 2, perPage: 10, search: 'café' });

    const [requestUrl, init] = fetchImpl.mock.calls[0]!;
    const url = new URL(String(requestUrl));
    expect(url.origin + url.pathname).toBe('https://shop.test/wp-json/wc/v3/products');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('per_page')).toBe('10');
    expect(url.searchParams.get('search')).toBe('café');
    expect(init?.headers).toMatchObject({
      Authorization: `Basic ${Buffer.from('ck_test:cs_test').toString('base64')}`,
    });
    expect(result).toMatchObject({ total: 21, totalPages: 3, page: 2 });
    expect(result.items[0]).toMatchObject({ id: 7, price: 9.5 });
  });

  it('returns null when WooCommerce answers 404', async () => {
    const { dataSource } = createDataSource(
      new Response(
        JSON.stringify({ code: 'woocommerce_rest_product_invalid_id', message: 'ID no válido' }),
        {
          status: 404,
        },
      ),
    );
    await expect(dataSource.getProduct(999)).resolves.toBeNull();
  });

  it('turns WooCommerce auth errors into a 502 with the original message', async () => {
    const { dataSource } = createDataSource(
      new Response(JSON.stringify({ message: 'Lo siento, no puedes listar los recursos.' }), {
        status: 401,
      }),
    );
    await expect(dataSource.listCategories()).rejects.toMatchObject({
      status: 502,
      message: 'WooCommerce: Lo siento, no puedes listar los recursos.',
    });
  });
});
