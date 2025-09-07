import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, Package, Truck, Star, AlertCircle } from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'error';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface OrderNotificationToastProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export default function OrderNotificationToast({ notifications, onRemove }: OrderNotificationToastProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Add new notifications
    notifications.forEach(notification => {
      if (!visibleNotifications.find(n => n.id === notification.id)) {
        setVisibleNotifications(prev => [...prev, notification]);
        
        // Auto remove after duration
        const duration = notification.duration || 5000;
        setTimeout(() => {
          handleRemove(notification.id);
        }, duration);
      }
    });
  }, [notifications]);

  const handleRemove = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    onRemove(id);
  };

  const getNotificationConfig = (type: ToastNotification['type']) => {
    const configs = {
      warning: {
        icon: Clock,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        iconColor: 'text-yellow-600 dark:text-yellow-400'
      },
      info: {
        icon: CheckCircle,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400'
      },
      secondary: {
        icon: Package,
        bgColor: 'bg-gray-50 dark:bg-gray-800/50',
        borderColor: 'border-gray-200 dark:border-gray-700',
        textColor: 'text-gray-800 dark:text-gray-300',
        iconColor: 'text-gray-600 dark:text-gray-400'
      },
      primary: {
        icon: Truck,
        bgColor: 'bg-primary-50 dark:bg-primary-900/20',
        borderColor: 'border-primary-200 dark:border-primary-800',
        textColor: 'text-primary-800 dark:text-primary-300',
        iconColor: 'text-primary-600 dark:text-primary-400'
      },
      success: {
        icon: Star,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400'
      },
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400'
      }
    };
    return configs[type];
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm">
      {visibleNotifications.map((notification) => {
        const config = getNotificationConfig(notification.type);
        const Icon = config.icon;
        
        return (
          <div
            key={notification.id}
            className={`
              p-4 rounded-soft-lg border shadow-soft-lg backdrop-blur-soft
              transform transition-all duration-300 ease-out
              animate-in slide-in-from-right-full
              ${config.bgColor} ${config.borderColor} ${config.textColor}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => handleRemove(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}