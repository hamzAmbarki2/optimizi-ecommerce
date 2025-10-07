import { useState, useEffect, useCallback } from 'react';
import { EnhancedNotificationService } from '../services/enhancedNotificationService';
import { BrowserNotificationService } from '../services/browserNotificationService';
import { EnhancedNotification, NotificationFilter, NotificationStats, NotificationPreferences } from '../types/notifications';

export const useEnhancedNotifications = (fournisseurId: string | null) => {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize browser notification service
  const browserNotificationService = BrowserNotificationService.getInstance();

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (
    filter: NotificationFilter = {},
    page: number = 1,
    append: boolean = false
  ) => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      if (!append) setLoading(true);
      setError(null);

      const result = await EnhancedNotificationService.getNotifications(
        fournisseurId,
        filter,
        20 * page
      );

      if (append) {
        setNotifications(prev => [...prev, ...result.notifications]);
      } else {
        setNotifications(result.notifications);
      }
      
      setHasMore(result.hasMore);
      setUnreadCount(result.notifications.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [fournisseurId]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!fournisseurId) return;

    try {
      const statsData = await EnhancedNotificationService.getNotificationStats(fournisseurId);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [fournisseurId]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!fournisseurId) return;

    try {
      const prefsData = await EnhancedNotificationService.getNotificationPreferences(fournisseurId);
      setPreferences(prefsData);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  }, [fournisseurId]);

  // Set up real-time listeners
  useEffect(() => {
    if (!fournisseurId) return;

    const unsubscribe = EnhancedNotificationService.subscribeToNotifications(
      fournisseurId,
      { isArchived: false },
      (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.isRead).length);
        
        // Check for new notifications and show browser notifications
        const now = new Date().getTime();
        const recentNotifications = newNotifications.filter(notification => {
          const notificationTime = new Date(notification.createdAt).getTime();
          return (now - notificationTime) < 10000 && !notification.isRead;
        });

        recentNotifications.forEach(notification => {
          browserNotificationService.showNotificationByType(notification);
        });
        
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [fournisseurId]);

  // Initialize
  useEffect(() => {
    if (fournisseurId) {
      fetchNotifications();
      fetchStats();
      fetchPreferences();
      
      // Initialize browser notifications
      browserNotificationService.initialize();
    }
  }, [fournisseurId, fetchNotifications, fetchStats, fetchPreferences]);

  // Notification actions
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const markMultipleAsRead = async (notificationIds: string[]) => {
    try {
      await EnhancedNotificationService.markMultipleAsRead(notificationIds);
      
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      const unreadInSelection = notifications.filter(n => 
        notificationIds.includes(n.id) && !n.isRead
      ).length;
      
      setUnreadCount(prev => Math.max(0, prev - unreadInSelection));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setError('Failed to mark notifications as read');
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await EnhancedNotificationService.archiveNotification(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isArchived: true, archivedAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('Error archiving notification:', err);
      setError('Failed to archive notification');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!fournisseurId) return;

    try {
      await EnhancedNotificationService.updateNotificationPreferences(fournisseurId, newPreferences);
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setCurrentPage(1);
    fetchNotifications();
    fetchStats();
  };

  return {
    notifications,
    stats,
    preferences,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markMultipleAsRead,
    archiveNotification,
    deleteNotification,
    updatePreferences,
    fetchNotifications,
    loadMore,
    refresh,
    clearError: () => setError(null)
  };
};