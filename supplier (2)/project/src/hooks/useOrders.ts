import { useState, useEffect } from 'react';
import { OrderService } from '../services/orderService';
import { NotificationService } from '../services/notificationService';
import { Order } from '../models';
import { showToast } from '../components/notifications/ToastContainer';

export const useOrders = (fournisseurId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ordersData = await OrderService.getOrdersByFournisseur(fournisseurId);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fournisseurId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));
      
      // Show success toast
      showToast({
        type: 'success',
        title: 'Order Updated',
        message: `Order status updated to ${newStatus}`
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status'
      });
      throw err;
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      await OrderService.updatePaymentStatus(orderId, newPaymentStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus: newPaymentStatus as Order['paymentStatus'] }
          : order
      ));
      
      // Show success toast
      showToast({
        type: 'success',
        title: 'Payment Updated',
        message: `Payment status updated to ${newPaymentStatus}`
      });
    } catch (err) {
      console.error('Error updating payment status:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update payment status'
      });
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    updatePaymentStatus
  };
};