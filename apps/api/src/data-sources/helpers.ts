import {
  ORDER_STATUSES,
  type DashboardStats,
  type Order,
  type Paginated,
  type Product,
} from '@woo/shared';

export const LOW_STOCK_THRESHOLD = 5;
const REVENUE_STATUSES = new Set<Order['status']>(['completed', 'processing']);

export function paginate<TItem>(items: TItem[], page: number, perPage: number): Paginated<TItem> {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    perPage,
    totalPages: Math.ceil(items.length / perPage),
  };
}

export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function buildDashboardStats(products: Product[], orders: Order[]): DashboardStats {
  const revenueOrders = orders.filter((order) => REVENUE_STATUSES.has(order.status));
  const totalRevenue = roundMoney(revenueOrders.reduce((sum, order) => sum + order.total, 0));

  const lowStockProducts = products
    .filter(
      (product): product is Product & { stockQuantity: number } =>
        product.stockQuantity !== null && product.stockQuantity <= LOW_STOCK_THRESHOLD,
    )
    .sort((first, second) => first.stockQuantity - second.stockQuantity)
    .map(({ id, name, stockQuantity }) => ({ id, name, stockQuantity }));

  return {
    currency: orders[0]?.currency ?? 'EUR',
    totalRevenue,
    ordersCount: orders.length,
    productsCount: products.length,
    averageOrderValue: revenueOrders.length ? roundMoney(totalRevenue / revenueOrders.length) : 0,
    lowStockProducts,
    ordersByStatus: ORDER_STATUSES.map((status) => ({
      status,
      count: orders.filter((order) => order.status === status).length,
    })),
  };
}
