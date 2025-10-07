import React, { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  BellIcon,
  CheckIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CogIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { EnhancedNotificationService } from '../../services/enhancedNotificationService';
import { EnhancedNotification, NotificationFilter } from '../../types/notifications';
import NotificationPreferencesComponent from './NotificationPreferences';
import { useNavigate } from 'react-router-dom';

interface EnhancedNotificationCenterProps {
  fournisseurId: string | null;
  fournisseurName?: string;
}

const EnhancedNotificationCenter: React.FC<EnhancedNotificationCenterProps> = ({ 
  fournisseurId,
  fournisseurName = ''
}) => {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>({ isArchived: false });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!fournisseurId) return;

    const unsubscribe = EnhancedNotificationService.subscribeToNotifications(
      fournisseurId,
      filter,
      (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.isRead).length);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [fournisseurId, filter]);

  const handleNotificationClick = async (notification: EnhancedNotification) => {
    try {
      // Mark as clicked and read
      if (!notification.clicked) {
        await EnhancedNotificationService.markAsClicked(notification.id);
      }
      if (!notification.isRead) {
        await updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'order':
          if (notification.orderId) {
            navigate(`/orders?highlight=${notification.orderId}`);
          } else {
            navigate('/orders');
          }
          break;
        case 'payment':
          navigate('/orders');
          break;
        case 'inventory':
        case 'product':
          if (notification.productId) {
            navigate(`/products?highlight=${notification.productId}`);
          } else {
            navigate('/products');
          }
          break;
        default:
          navigate('/notifications');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleBulkAction = async (action: 'read' | 'archive' | 'delete') => {
    if (selectedNotifications.length === 0) return;

    try {
      switch (action) {
        case 'read':
          await EnhancedNotificationService.markMultipleAsRead(selectedNotifications);
          break;
        case 'archive':
          await EnhancedNotificationService.archiveMultiple(selectedNotifications);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete these notifications?')) {
            await EnhancedNotificationService.deleteMultiple(selectedNotifications);
          }
          break;
      }
      setSelectedNotifications([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <InformationCircleIcon className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const displayedNotifications = notifications.slice(0, 8);

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
          <BellIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-3xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Notification preferences"
                  >
                    <CogIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('/notifications')}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="View all notifications"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              {selectedNotifications.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedNotifications.length} selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBulkAction('read')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark Read
                      </button>
                      <button
                        onClick={() => handleBulkAction('archive')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => setSelectedNotifications([])}
                        className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex items-start space-x-3 p-4 rounded-2xl border border-gray-100">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                      <BellIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
                    <p className="text-gray-400 text-xs mt-1">You'll see updates here when they arrive</p>
                  </div>
                ) : (
                  <>
                    {displayedNotifications.map((notification) => (
                      <Menu.Item key={notification.id}>
                        {({ active }) => (
                          <div
                            className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border-l-4 ${
                              active ? 'bg-gray-50' : ''
                            } ${
                              !notification.isRead 
                                ? `${getPriorityColor(notification.priority)} shadow-sm` 
                                : 'border-l-gray-200 hover:border-l-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedNotifications.includes(notification.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedNotifications([...selectedNotifications, notification.id]);
                                  } else {
                                    setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                                  }
                                }}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              
                              <div 
                                onClick={() => handleNotificationClick(notification)}
                                className="flex-1 min-w-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <p className={`text-sm font-semibold truncate ${
                                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    {getPriorityIcon(notification.priority)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                    <span className="text-xs text-gray-500 font-medium">
                                      {formatTimeAgo(notification.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      notification.type === 'order' ? 'bg-blue-100 text-blue-800' :
                                      notification.type === 'payment' ? 'bg-green-100 text-green-800' :
                                      notification.type === 'inventory' ? 'bg-orange-100 text-orange-800' :
                                      notification.type === 'product' ? 'bg-purple-100 text-purple-800' :
                                      notification.type === 'system' ? 'bg-gray-100 text-gray-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {notification.type}
                                    </span>
                                    
                                    {notification.orderId && (
                                      <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                                        #{notification.orderId.slice(-6)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    ))}

                    {/* View All Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate('/notifications')}
                        className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300"
                      >
                        View All Notifications ({notifications.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Notification Preferences Modal */}
      {showPreferences && fournisseurId && (
        <NotificationPreferencesComponent
          fournisseurId={fournisseurId}
          onClose={() => setShowPreferences(false)}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default EnhancedNotificationCenter;