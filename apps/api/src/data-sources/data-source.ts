import type {
  Category,
  CreateOrderInput,
  DashboardStats,
  Order,
  OrderStatus,
  Paginated,
  ParsedOrderListQuery,
  ParsedProductListQuery,
  Product,
  ProductInput,
} from '@woo/shared';

export type OrderCustomer = Order['customer'];

export interface DataSource {
  listProducts(query: ParsedProductListQuery): Promise<Paginated<Product>>;
  getProduct(productId: number): Promise<Product | null>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(productId: number, input: ProductInput): Promise<Product | null>;

  listCategories(): Promise<Category[]>;

  listOrders(query: ParsedOrderListQuery): Promise<Paginated<Order>>;
  listOrdersByCustomerEmail(email: string): Promise<Order[]>;
  getOrder(orderId: number): Promise<Order | null>;
  updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order | null>;
  createOrder(input: CreateOrderInput, customer: OrderCustomer): Promise<Order>;

  getStats(): Promise<DashboardStats>;
}
