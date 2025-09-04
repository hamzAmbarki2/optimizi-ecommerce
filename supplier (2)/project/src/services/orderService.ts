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

// Toast notification helpers
const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
  if ((window as any).showToast) {
    (window as any).showToast({ type, title, message });
  }
};

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

      const masterOrderId = await masterOrderService.createMasterOrder(masterOrderData);
      
      // Show success notification
      showToast(
        'success',
        'Order Placed Successfully! 🎉',
        `Your order #${masterOrderId.slice(-8)} has been placed and suppliers have been notified.`
      );

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Order Placed Successfully!', {
          body: `Your order worth $${orderData.total.toFixed(2)} has been placed`,
          icon: '/favicon.ico',
          tag: `order-placed-${masterOrderId}`
        });
      }

      return masterOrderId;
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Show error notification
      showToast(
        'error',
        'Order Failed',
        'There was an error placing your order. Please try again.'
      );
      
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
          promoCode: masterOrder.promoCode || undefined,
          orderNotes: masterOrder.orderNotes || undefined,
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

      // Show status update notification
      const statusMessages = {
        'pending': 'Your order is pending confirmation',
        'confirmed': 'Your order has been confirmed',
        'preparing': 'Your order is being prepared',
        'out_for_delivery': 'Your order is out for delivery',
        'delivered': 'Your order has been delivered',
        'cancelled': 'Your order has been cancelled'
      };

      const paymentMessages = {
        'pending': 'Payment is pending',
        'paid': 'Payment confirmed',
        'failed': 'Payment failed'
      };

      if (status) {
        showToast(
          status === 'delivered' ? 'success' : 'info',
          'Order Status Updated',
          statusMessages[status] || `Order status updated to ${status}`
        );
      }

      if (paymentStatus) {
        showToast(
          paymentStatus === 'paid' ? 'success' : paymentStatus === 'failed' ? 'error' : 'info',
          'Payment Status Updated',
          paymentMessages[paymentStatus] || `Payment status updated to ${paymentStatus}`
        );
      }

      // The master order status will be synced automatically by updateSubOrderStatus
    } catch (error) {
      console.error('Error updating order status:', error);
      
      showToast(
        'error',
        'Update Failed',
        'Failed to update order status. Please try again.'
      );
      
      throw new Error('Failed to update order status');
    }
  },

  // Subscribe to order status changes for real-time updates
  subscribeToOrderUpdates(userId: string, callback: (orders: Order[]) => void): () => void {
    try {
      return masterOrderService.subscribeToMasterOrdersByUserId(userId, async (masterOrders) => {
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
            promoCode: masterOrder.promoCode || undefined,
            orderNotes: masterOrder.orderNotes || undefined,
            createdAt: masterOrder.createdAt,
            updatedAt: masterOrder.updatedAt,
            confirmedAt: masterOrder.confirmedAt,
            deliveredAt: masterOrder.deliveredAt
          };

          orders.push(order);
        }

        callback(orders);
      });
    } catch (error) {
      console.error('Error subscribing to order updates:', error);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Show order confirmation notification
  showOrderConfirmationNotification(order: Order): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Confirmed!', {
        body: `Your order #${order.id.slice(-8)} worth $${order.total.toFixed(2)} has been confirmed`,
        icon: '/favicon.ico',
        tag: `order-confirmed-${order.id}`,
        actions: [
          {
            action: 'view',
            title: 'View Order'
          }
        ]
      });
    }

    showToast(
      'success',
      'Order Confirmed! ✅',
      `Your order #${order.id.slice(-8)} has been confirmed and is being processed.`
    );
  },

  // Show order shipped notification
  showOrderShippedNotification(order: Order): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Shipped!', {
        body: `Your order #${order.id.slice(-8)} is on its way!`,
        icon: '/favicon.ico',
        tag: `order-shipped-${order.id}`
      });
    }

    showToast(
      'info',
      'Order Shipped! 🚚',
      `Your order #${order.id.slice(-8)} is on its way to you.`
    );
  },

  // Show order delivered notification
  showOrderDeliveredNotification(order: Order): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Delivered!', {
        body: `Your order #${order.id.slice(-8)} has been delivered!`,
        icon: '/favicon.ico',
        tag: `order-delivered-${order.id}`
      });
    }

    showToast(
      'success',
      'Order Delivered! 🎉',
      `Your order #${order.id.slice(-8)} has been successfully delivered. Enjoy your purchase!`
    );
  }
};

