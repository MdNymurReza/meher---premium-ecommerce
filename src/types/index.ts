export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  wishlist: string[];
  createdAt: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  stock: number;
  status: 'Available' | 'Out of Stock';
  images: string[];
  rating: number;
  numReviews: number;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  active: boolean;
  createdAt: any;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  products: OrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  shippingCost?: number;
  totalPrice: number;
  paymentMethod: 'COD' | 'bKash';
  transactionId?: string;
  address: string;
  phone: string;
  status: OrderStatus;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  createdAt: any;
}

export interface SiteSettings {
  heroImage: string;
  heroHeading: string;
  heroSubheading: string;
  marqueeText: string[];
  brandStoryImage: string;
  updatedAt: any;
}

export const CATEGORIES = [
  "Jewellery",
  "Men's Clothing",
  "Women's Clothing",
  "Kids Clothing"
];
