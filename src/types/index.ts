export type Gender = 'MEN' | 'WOMEN' | 'CHILDREN' | 'UNISEX';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  productCount?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  stock: number;
  gender: Gender;
  categoryId: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
}

export interface OrderPayload {
  customerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderResponse {
  id?: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items?: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: Product;
  }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export type ScreenName =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'login'
  | 'admin-products'
  | 'admin-orders';

export interface NavigationRoute {
  name: ScreenName;
  params?: {
    productId?: number;
    category?: string;
    gender?: Gender;
    search?: string;
    orderNumber?: string;
    returnTo?: ScreenName;
  };
}
