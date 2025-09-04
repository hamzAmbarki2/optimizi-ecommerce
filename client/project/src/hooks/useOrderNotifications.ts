import { useState, useEffect } from 'react';
import { useOrders } from './useOrders';
import { useApp } from '../context/AppContext';

interface OrderNotification {
  id: string;
  type: 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'error';
  title: string;
  message: string;
  orderId: string;
  timestamp: Date;
}

export const useOrderNotifications = () => {
  const { state } = useApp();
  const { orders } = useOrders(state.user?.id);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [lastOrderStatuses, setLastOrderStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!orders.length || !state.isAuthenticated) return;

    const newNotifications: OrderNotification[] = [];

    orders.forEach(order => {
      const lastStatus = lastOrderStatuses[order.id];
      
      // If this is a new order or status has changed
      if (lastStatus && lastStatus !== order.status) {
        const notification = createOrderNotification(order);
        if (notification) {
          newNotifications.push(notification);
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }

    // Update last known statuses
    const statusMap: Record<string, string> = {};
    orders.forEach(order => {
      statusMap[order.id] = order.status;
    });
    setLastOrderStatuses(statusMap);
  }, [orders, lastOrderStatuses, state.isAuthenticated]);

  const createOrderNotification = (order: any): OrderNotification | null => {
    const orderNumber = order.id.slice(-8).toUpperCase();
    
    const statusConfig = {
      pending: {
        type: 'warning' as const,
        title: 'Commande en attente',
        message: `Votre commande #${orderNumber} est en cours de traitement`
      },
      confirmed: {
        type: 'info' as const,
        title: 'Commande confirmée',
        message: `Votre commande #${orderNumber} a été confirmée !`
      },
      preparing: {
        type: 'secondary' as const,
        title: 'Préparation en cours',
        message: `Votre commande #${orderNumber} est en cours de préparation`
      },
      out_for_delivery: {
        type: 'primary' as const,
        title: 'En cours de livraison',
        message: `Votre commande #${orderNumber} est en route !`
      },
      delivered: {
        type: 'success' as const,
        title: 'Commande livrée',
        message: `Votre commande #${orderNumber} a été livrée ! Bon appétit !`
      },
      cancelled: {
        type: 'error' as const,
        title: 'Commande annulée',
        message: `Votre commande #${orderNumber} a été annulée`
      }
    };

    const config = statusConfig[order.status as keyof typeof statusConfig];
    if (!config) return null;

    return {
      id: `${order.id}-${order.status}-${Date.now()}`,
      type: config.type,
      title: config.title,
      message: config.message,
      orderId: order.id,
      timestamp: new Date()
    };
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    removeNotification,
    clearAllNotifications
  };
};