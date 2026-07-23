export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'delivery';
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  phone?: string;
  address?: string;
  landmark?: string;
  vehicleType?: string;
  licenseNumber?: string;
  rewardPoints?: number;
  referralCode?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVeg?: boolean;
  isSpecial?: boolean;
  spiceLevel?: number; // 0 for none, 1-3 for chilis
  discountPercent: number; // 0 for no discount
  createdAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  notes?: string;
  orderType?: 'Pickup' | 'Delivery';
  paymentMethod?: 'UPI/QR' | 'Cash';
  couponCode?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  status: OrderStatus;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  email: string;
  deliveryCharge: number;
  minOrder: number;
  openingHours: string;
  closingHours: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  whatsappNumber?: string;
  locationUrl?: string;
  aboutSection: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
  read: boolean;
  orderId?: string;
  userId?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  customersCount: number;
  popularFoods: Array<{
    name: string;
    count: number;
    revenue: number;
    image: string;
  }>;
  salesData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}
