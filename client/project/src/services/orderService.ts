import { Order, OrderItem, CartItem, DeliveryAddress } from '../types';
import { masterOrderService, CreateMasterOrderData } from './masterOrderService';

export interface CreateOrderData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  promoCode?: string;
  orderNotes?: string;
}

export const orderService = {
  // Create a new order using the new master/sub-order system
  async createOrder(orderData: CreateOrderData): Promise<string> {
    try {
      // Use the new master order service
      const masterOrderData: CreateMasterOrderData = {
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        userName: orderData.userName,
        userPhone: orderData.userPhone,
        items: orderData.items,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        tax: orderData.tax,
        promoDiscount: orderData.promoDiscount,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        deliveryAddress: orderData.deliveryAddress,
        promoCode: orderData.promoCode,
        orderNotes: orderData.orderNotes
      };

      return await masterOrderService.createMasterOrder(masterOrderData);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  },

  // Get order by ID (now gets master order)
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const masterOrder = await masterOrderService.getMasterOrderById(orderId);
      if (!masterOrder) return null;

      // Get sub-orders to reconstruct the full order view
      const subOrders = await masterOrderService.getSubOrdersByMasterOrderId(orderId);
      
      // Combine all items from sub-orders
      const allItems: OrderItem[] = [];
      subOrders.forEach(subOrder => {
        allItems.push(...subOrder.items);
      });

      // Convert master order to legacy Order format for compatibility
      const order: Order = {
        id: masterOrder.id,
        userId: masterOrder.userId,
        userEmail: masterOrder.userEmail,
        userName: masterOrder.userName,
        userPhone: masterOrder.userPhone,
        items: allItems,
        subtotal: masterOrder.subtotal,
        deliveryFee: masterOrder.deliveryFee,
        tax: masterOrder.tax,
        promoDiscount: masterOrder.promoDiscount,
        total: masterOrder.total,
        status: masterOrder.status,
        paymentStatus: masterOrder.paymentStatus,
        paymentMethod: masterOrder.paymentMethod,
        deliveryAddress: masterOrder.deliveryAddress,
        promoCode: masterOrder.promoCode,
        orderNotes: masterOrder.orderNotes,
        createdAt: masterOrder.createdAt,
        updatedAt: masterOrder.updatedAt,
        confirmedAt: masterOrder.confirmedAt,
        deliveredAt: masterOrder.deliveredAt
      };

      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  },

  // Get orders by user ID (now gets master orders)
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const masterOrders = await masterOrderService.getMasterOrdersByUserId(userId);
      const orders: Order[] = [];

      for (const masterOrder of masterOrders) {
        // Get sub-orders to reconstruct the full order view
        const subOrders = await masterOrderService.getSubOrdersByMasterOrderId(masterOrder.id);
        
        // Combine all items from sub-orders
        const allItems: OrderItem[] = [];
        subOrders.forEach(subOrder => {
          allItems.push(...subOrder.items);
        });

        // Convert master order to legacy Order format for compatibility
        const order: Order = {
          id: masterOrder.id,
          userId: masterOrder.userId,
          userEmail: masterOrder.userEmail,
          userName: masterOrder.userName,
          userPhone: masterOrder.userPhone,
          items: allItems,
          subtotal: masterOrder.subtotal,
          deliveryFee: masterOrder.deliveryFee,
          tax: masterOrder.tax,
          promoDiscount: masterOrder.promoDiscount,
          total: masterOrder.total,
          status: masterOrder.status,
          paymentStatus: masterOrder.paymentStatus,
          paymentMethod: masterOrder.paymentMethod,
          deliveryAddress: masterOrder.deliveryAddress,
          promoCode: masterOrder.promoCode || undefined, // Convert empty string or null to undefined for compatibility
          orderNotes: masterOrder.orderNotes || undefined, // Convert empty string or null to undefined for compatibility
          createdAt: masterOrder.createdAt,
          updatedAt: masterOrder.updatedAt,
          confirmedAt: masterOrder.confirmedAt,
          deliveredAt: masterOrder.deliveredAt
        };

        orders.push(order);
      }

      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  },

  // Update order status (now updates master order through sub-orders)
  async updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<void> {
    try {
      // Get all sub-orders for this master order
      const subOrders = await masterOrderService.getSubOrdersByMasterOrderId(orderId);
      
      // Update all sub-orders with the new status
      for (const subOrder of subOrders) {
        await masterOrderService.updateSubOrderStatus(subOrder.id, status, paymentStatus);
      }

      // The master order status will be synced automatically by updateSubOrderStatus
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
};

