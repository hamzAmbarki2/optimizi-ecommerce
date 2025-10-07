// File: /home/ubuntu/project-bolt/project/src/models/index.ts

// User Models
export interface UserData {
  uid: string;
  email: string;
  role: 'supplier' | 'admin' | 'client';
  fullName?: string;
  imageUrl?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Supplier Models
export interface Fournisseur {
  id: string;
  name: string;
  matriculeFiscale: string;
  address: string;
  openingHours: string;
  image: string;
  ownerId: string;
  estimatedDeliveryMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

// Product Models
export interface Product {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  categoryId: string;
  stockQuantity: number;
  isAvailable: boolean;
  discount: string;
  unit: string;
  tva: number;
  prixHTVA: string;
  prixTTC: string;
  prixAfterDiscount: string;
  feature: boolean;
  FournisseurId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Category Models
export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  FournisseurId: string;
  createdAt: string;
  updatedAt: string;
}

// Order Models
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface Order {
  id: string;
  masterOrderId: string;
  fournisseurId: string;
  fournisseurName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  orderNotes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// Dashboard Models
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

export interface MonthlyData {
  name: string;
  sales: number;
  orders: number;
}

// Notification Models (simple order notifications only)
export interface AppNotification {
  id: string;
  type: 'order';
  title: string;
  message: string;
  orderId: string;
  fournisseurId: string;
  isRead: boolean;
  createdAt: string;
  orderData?: {
    customerName: string;
    customerEmail: string;
    total: number;
    itemCount: number;
    status: string;
  };
}

// Simple notification preferences (removed complex preferences)
export interface NotificationPreferences {
  orderNotifications: boolean; // Only order notifications for suppliers
}
