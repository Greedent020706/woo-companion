import type {
  Category,
  CreateOrderInput,
  Order,
  OrderStatus,
  ParsedOrderListQuery,
  ParsedProductListQuery,
  Product,
  ProductInput,
} from '@woo/shared';
import categoriesFixture from '../fixtures/categories.json' with { type: 'json' };
import ordersFixture from '../fixtures/orders.json' with { type: 'json' };
import productsFixture from '../fixtures/products.json' with { type: 'json' };
import { HttpError } from '../http-error';
import type { DataSource, OrderCustomer } from './data-source';
import { buildDashboardStats, normalizeForSearch, paginate, roundMoney } from './helpers';

function slugify(text: string): string {
  return normalizeForSearch(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class MockDataSource implements DataSource {
  private products = structuredClone(productsFixture) as Product[];
  private categories = structuredClone(categoriesFixture) as Category[];
  private orders = structuredClone(ordersFixture) as Order[];

  async listProducts({ search, category, status, page, perPage }: ParsedProductListQuery) {
    const normalizedSearch = search ? normalizeForSearch(search) : '';
    const matchingProducts = this.products.filter(
      (product) =>
        (!normalizedSearch ||
          normalizeForSearch(`${product.name} ${product.sku}`).includes(normalizedSearch)) &&
        (!category ||
          product.categories.some((productCategory) => productCategory.id === category)) &&
        (!status || product.status === status),
    );
    return paginate(matchingProducts, page, perPage);
  }

  async getProduct(productId: number) {
    return this.products.find((product) => product.id === productId) ?? null;
  }

  async createProduct(input: ProductInput) {
    const nextId = Math.max(...this.products.map((product) => product.id)) + 1;
    const product = this.buildProduct(nextId, new Date().toISOString(), input);
    this.products.unshift(product);
    this.refreshCategoryCounts();
    return product;
  }

  async updateProduct(productId: number, input: ProductInput) {
    const index = this.products.findIndex((product) => product.id === productId);
    const existingProduct = this.products[index];
    if (!existingProduct) return null;
    const updatedProduct = this.buildProduct(productId, existingProduct.createdAt, input);
    this.products[index] = updatedProduct;
    this.refreshCategoryCounts();
    return updatedProduct;
  }

  async listCategories() {
    return this.categories;
  }

  async listOrders({ status, search, page, perPage }: ParsedOrderListQuery) {
    const normalizedSearch = search ? normalizeForSearch(search) : '';
    const matchingOrders = this.orders.filter((order) => {
      const searchableText = `${order.number} ${order.customer.firstName} ${order.customer.lastName} ${order.customer.email}`;
      return (
        (!status || order.status === status) &&
        (!normalizedSearch || normalizeForSearch(searchableText).includes(normalizedSearch))
      );
    });
    return paginate(matchingOrders, page, perPage);
  }

  async listOrdersByCustomerEmail(email: string) {
    return this.orders.filter(
      (order) => order.customer.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async getOrder(orderId: number) {
    return this.orders.find((order) => order.id === orderId) ?? null;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = this.orders.find((candidate) => candidate.id === orderId);
    if (!order) return null;
    order.status = status;
    return order;
  }

  async createOrder(input: CreateOrderInput, customer: OrderCustomer) {
    const lineItems = input.lineItems.map(({ productId, quantity }) => {
      const product = this.products.find((candidate) => candidate.id === productId);
      if (!product || product.status !== 'publish') {
        throw new HttpError(422, `El producto ${productId} no está disponible`);
      }
      if (product.stockStatus === 'outofstock') {
        throw new HttpError(409, `«${product.name}» está agotado`);
      }
      if (product.stockQuantity !== null && product.stockQuantity < quantity) {
        throw new HttpError(
          409,
          `Solo quedan ${product.stockQuantity} unidades de «${product.name}»`,
        );
      }
      return { product, quantity };
    });

    for (const { product, quantity } of lineItems) {
      if (product.stockQuantity === null) continue;
      product.stockQuantity -= quantity;
      if (product.stockQuantity === 0) product.stockStatus = 'outofstock';
    }

    const nextId = Math.max(...this.orders.map((order) => order.id)) + 1;
    const orderLineItems = lineItems.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
      total: roundMoney(product.price * quantity),
    }));
    const order: Order = {
      id: nextId,
      number: String(nextId),
      status: 'processing',
      currency: 'EUR',
      total: roundMoney(orderLineItems.reduce((sum, item) => sum + item.total, 0)),
      createdAt: new Date().toISOString(),
      customer,
      lineItems: orderLineItems,
    };
    this.orders.unshift(order);
    return order;
  }

  async getStats() {
    return buildDashboardStats(this.products, this.orders);
  }

  private buildProduct(id: number, createdAt: string, input: ProductInput): Product {
    const stockStatus =
      input.stockQuantity === null || input.stockQuantity > 0 ? 'instock' : 'outofstock';
    return {
      id,
      name: input.name,
      slug: slugify(input.name),
      sku: input.sku,
      status: input.status,
      price: input.salePrice ?? input.regularPrice,
      regularPrice: input.regularPrice,
      salePrice: input.salePrice,
      stockStatus,
      stockQuantity: input.stockQuantity,
      categories: this.categories
        .filter((category) => input.categoryIds.includes(category.id))
        .map(({ id: categoryId, name }) => ({ id: categoryId, name })),
      imageUrl: input.imageUrl || null,
      shortDescription: input.shortDescription,
      description: input.description,
      createdAt,
    };
  }

  private refreshCategoryCounts() {
    for (const category of this.categories) {
      category.count = this.products.filter((product) =>
        product.categories.some((productCategory) => productCategory.id === category.id),
      ).length;
    }
  }
}
