// Simple notifications page for suppliers - focused on orders only
import React from 'react';
import { BellIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationService } from '../services/notificationService';

const Notifications: React.FC = () => {
  const { notifications, unreadCount, stats, loading, markAsRead, markAllAsRead, refresh } = useNotifications();

  const handleNotificationClick = async (notificationId: string, orderId: string) => {
    await markAsRead(notificationId);
    // Navigate to orders page
    window.location.href = `/orders`;
  };

  const handleRefresh = () => {
    refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BellIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Restez informé de vos nouvelles commandes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckIcon className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Non lues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">
              Vous recevrez ici les notifications de vos nouvelles commandes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.orderId)}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Order Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">🛍️</span>
                    </div>
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      
                      {!notification.isRead && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-600 font-medium">Nouveau</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {notification.message}
                    </p>
                    
                    {notification.orderData && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Détails de la commande</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Client:</span> {notification.orderData.customerName}
                          </div>
                          <div>
                            <span className="font-medium">Articles:</span> {notification.orderData.itemCount}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> TND{notification.orderData.total.toFixed(2)}
                          </div>
                        </div>
                        {notification.orderData.customerEmail && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {notification.orderData.customerEmail}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {NotificationService.formatTime(notification.createdAt)}
                      </span>
                      
                      <span className="text-sm text-blue-600 font-medium">
                        Voir la commande →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;