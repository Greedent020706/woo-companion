import { HttpError } from '../../http-error';

export type WooClientOptions = {
  url: string;
  key: string;
  secret: string;
  fetchImpl?: typeof fetch;
};

type WooRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT';
  query?: Record<string, string | number | undefined>;
  body?: unknown;
};

export type WooResponse<TData> = {
  data: TData;
  total: number;
  totalPages: number;
};

export function createWooClient({ url, key, secret, fetchImpl = fetch }: WooClientOptions) {
  const apiRoot = `${url.replace(/\/+$/, '')}/wp-json/wc/v3`;
  const authorization = `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;

  return async function wooRequest<TData>(
    path: string,
    { method = 'GET', query = {}, body }: WooRequestOptions = {},
  ): Promise<WooResponse<TData>> {
    const requestUrl = new URL(`${apiRoot}${path}`);
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') requestUrl.searchParams.set(name, String(value));
    }

    let response: Response;
    try {
      response = await fetchImpl(requestUrl, {
        method,
        headers: {
          Authorization: authorization,
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      console.error('WooCommerce no responde:', error);
      throw new HttpError(502, 'No se pudo conectar con la tienda WooCommerce');
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const wooMessage =
        payload && typeof payload === 'object' && 'message' in payload
          ? String(payload.message)
          : `HTTP ${response.status}`;
      const status = response.status === 404 ? 404 : 502;
      throw new HttpError(status, `WooCommerce: ${wooMessage}`);
    }

    return {
      data: payload as TData,
      total: Number(response.headers.get('X-WP-Total') ?? 0),
      totalPages: Number(response.headers.get('X-WP-TotalPages') ?? 0),
    };
  };
}

export type WooRequest = ReturnType<typeof createWooClient>;
