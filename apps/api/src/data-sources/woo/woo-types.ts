export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  status: string;
  date_created_gmt: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  categories: { id: number; name: string; slug: string }[];
  images: { src: string }[];
  short_description: string;
  description: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export type WooOrder = {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  date_created_gmt: string;
  billing: { first_name: string; last_name: string; email: string };
  line_items: {
    product_id: number;
    name: string;
    quantity: number;
    price: number | string;
    total: string;
  }[];
};

export type WooProductPayload = {
  name: string;
  sku: string;
  status: string;
  regular_price: string;
  sale_price: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  categories: { id: number }[];
  images: { src: string }[];
  short_description: string;
  description: string;
};
