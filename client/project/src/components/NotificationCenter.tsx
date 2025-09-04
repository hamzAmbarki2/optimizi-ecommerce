import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, Package, Truck, Star, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'error';
  title: string;
  message: string;
  orderId?: string;
  timestamp: Date;
  read: boolean;
  icon: React.ReactNode;
}

export default function NotificationCenter() {
  const { state } = useApp();
  const { orders } = useOrders(state.user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastOrderStatuses, setLastOrderStatuses] = useState<Record<string, string>>({});

  // Generate notifications based on order status changes
  useEffect(() => {
    if (!orders.length) return;

    const newNotifications: Notification[] = [];

    orders.forEach(order => {
      const lastStatus = lastOrderStatuses[order.id];
      
      // If this is a new order or status has changed
      if (!lastStatus || lastStatus !== order.status) {
        const notification = createOrderNotification(order);
        if (notification) {
          newNotifications.push(notification);
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50 notifications
    }

    // Update last known statuses
    const statusMap: Record<string, string> = {};
    orders.forEach(order => {
      statusMap[order.id] = order.status;
    });
    setLastOrderStatuses(statusMap);
  }, [orders, lastOrderStatuses]);

  const createOrderNotification = (order: any): Notification | null => {
    const orderNumber = order.id.slice(-8).toUpperCase();
    
    const statusConfig = {
      pending: {
        type: 'warning' as const,
        title: 'Commande en attente',
        message: `Votre commande #${orderNumber} est en cours de traitement`,
        icon: <Clock className="w-5 h-5" />
      },
      confirmed: {
        type: 'info' as const,
        title: 'Commande confirmée',
        message: `Votre commande #${orderNumber} a été confirmée et sera bientôt préparée`,
        icon: <CheckCircle className="w-5 h-5" />
      },
      preparing: {
        type: 'secondary' as const,
        title: 'Préparation en cours',
        message: `Votre commande #${orderNumber} est en cours de préparation`,
        icon: <Package className="w-5 h-5" />
      },
      out_for_delivery: {
        type: 'primary' as const,
        title: 'En cours de livraison',
        message: `Votre commande #${orderNumber} est en route ! Livraison prévue sous peu`,
        icon: <Truck className="w-5 h-5" />
      },
      delivered: {
        type: 'success' as const,
        title: 'Commande livrée',
        message: `Votre commande #${orderNumber} a été livrée avec succès ! Bon appétit !`,
        icon: <Star className="w-5 h-5" />
      },
      cancelled: {
        type: 'error' as const,
        title: 'Commande annulée',
        message: `Votre commande #${orderNumber} a été annulée`,
        icon: <AlertCircle className="w-5 h-5" />
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
      timestamp: new Date(),
      read: false,
      icon: config.icon
    };
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationStyles = (type: Notification['type']) => {
    const styles = {
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
      secondary: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300',
      primary: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300',
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
    };
    return styles[type];
  };

  if (!state.isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-soft hover:bg-primary-50 dark:hover:bg-primary-900/20"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-soft animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft rounded-soft-lg shadow-soft-xl border border-white/20 dark:border-neutral-700/30 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-800 dark:text-white">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <h4 className="font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                    Aucune notification
                  </h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Vos notifications de commande apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 mb-2 rounded-soft-lg border transition-all duration-200 hover:shadow-soft ${
                        getNotificationStyles(notification.type)
                      } ${!notification.read ? 'ring-1 ring-current ring-opacity-20' : 'opacity-75'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm opacity-90 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-xs opacity-70 mt-2">
                                {notification.timestamp.toLocaleString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
                                  title="Marquer comme lu"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
                                title="Supprimer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to orders page
                    window.location.href = '/orders';
                  }}
                  className="w-full text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Voir toutes les commandes
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}