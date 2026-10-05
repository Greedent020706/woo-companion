import {
  ORDER_STATUSES,
  STOCK_STATUSES,
  type Category,
  type Order,
  type OrderStatus,
  type Product,
  type ProductInput,
  type StockStatus,
} from '@woo/shared';
import type { WooCategory, WooOrder, WooProduct, WooProductPayload } from './woo-types';

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#8217;': '’',
  '&nbsp;': ' ',
};

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[#a-z0-9]+;/gi, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseWooPrice(price: string | number | null | undefined): number | null {
  if (price === '' || price === null || price === undefined) return null;
  const amount = Number(price);
  return Number.isFinite(amount) ? amount : null;
}

function toIsoDate(wooGmtDate: string): string {
  return wooGmtDate.endsWith('Z') ? wooGmtDate : `${wooGmtDate}Z`;
}

function toStockStatus(wooStockStatus: string): StockStatus {
  return (STOCK_STATUSES as readonly string[]).includes(wooStockStatus)
    ? (wooStockStatus as StockStatus)
    : 'instock';
}

function toOrderStatus(wooStatus: string): OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(wooStatus)
    ? (wooStatus as OrderStatus)
    : 'pending';
}

export function mapWooProduct(wooProduct: WooProduct): Product {
  const regularPrice = parseWooPrice(wooProduct.regular_price) ?? 0;
  return {
    id: wooProduct.id,
    name: stripHtml(wooProduct.name),
    slug: wooProduct.slug,
    sku: wooProduct.sku,
    status: wooProduct.status === 'publish' ? 'publish' : 'draft',
    price: parseWooPrice(wooProduct.price) ?? regularPrice,
    regularPrice,
    salePrice: parseWooPrice(wooProduct.sale_price),
    stockStatus: toStockStatus(wooProduct.stock_status),
    stockQuantity: wooProduct.manage_stock ? wooProduct.stock_quantity : null,
    categories: wooProduct.categories.map(({ id, name }) => ({ id, name: stripHtml(name) })),
    imageUrl: wooProduct.images[0]?.src ?? null,
    shortDescription: stripHtml(wooProduct.short_description),
    description: stripHtml(wooProduct.description),
    createdAt: toIsoDate(wooProduct.date_created_gmt),
  };
}

export function mapWooCategory(wooCategory: WooCategory): Category {
  return {
    id: wooCategory.id,
    name: stripHtml(wooCategory.name),
    slug: wooCategory.slug,
    count: wooCategory.count,
  };
}

export function mapWooOrder(wooOrder: WooOrder): Order {
  return {
    id: wooOrder.id,
    number: wooOrder.number,
    status: toOrderStatus(wooOrder.status),
    currency: wooOrder.currency,
    total: parseWooPrice(wooOrder.total) ?? 0,
    createdAt: toIsoDate(wooOrder.date_created_gmt),
    customer: {
      firstName: wooOrder.billing.first_name,
      lastName: wooOrder.billing.last_name,
      email: wooOrder.billing.email,
    },
    lineItems: wooOrder.line_items.map((lineItem) => ({
      productId: lineItem.product_id,
      name: lineItem.name,
      quantity: lineItem.quantity,
      price: parseWooPrice(lineItem.price) ?? 0,
      total: parseWooPrice(lineItem.total) ?? 0,
    })),
  };
}

export function toWooProductPayload(input: ProductInput): WooProductPayload {
  return {
    name: input.name,
    sku: input.sku,
    status: input.status,
    regular_price: input.regularPrice.toFixed(2),
    sale_price: input.salePrice === null ? '' : input.salePrice.toFixed(2),
    manage_stock: input.stockQuantity !== null,
    stock_quantity: input.stockQuantity,
    categories: input.categoryIds.map((id) => ({ id })),
    images: input.imageUrl ? [{ src: input.imageUrl }] : [],
    short_description: input.shortDescription,
    description: input.description,
  };
}
