import { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderService } from '../services/orderService';

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderService.getOrdersByUserId(userId);
      
      // Sort orders by createdAt in descending order (newest first)
      const sortedOrders = fetchedOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setOrders(sortedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error in useOrders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    refetch
  };
};

export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedOrder = await orderService.getOrderById(orderId);
        setOrder(fetchedOrder);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
        console.error('Error in useOrder:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return {
    order,
    loading,
    error
  };
};