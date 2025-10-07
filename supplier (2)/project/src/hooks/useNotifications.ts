// Simple notification hook for suppliers - focused on orders only
import { useState, useEffect } from 'react';
import { NotificationService } from '../services/notificationService';
import { Notification, NotificationStats } from '../types/notifications';
import { useFournisseur } from './useFournisseur';

export const useNotifications = () => {
  const { fournisseur } = useFournisseur();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial notifications
  useEffect(() => {
    if (!fournisseur?.id) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const [notificationsData, unreadCountData, statsData] = await Promise.all([
          NotificationService.getNotifications(fournisseur.id),
          NotificationService.getUnreadCount(fournisseur.id),
          NotificationService.getStats(fournisseur.id)
        ]);

        setNotifications(notificationsData);
        setUnreadCount(unreadCountData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [fournisseur?.id]);

  // Set up real-time listeners
  useEffect(() => {
    if (!fournisseur?.id) return;

    const unsubscribeNotifications = NotificationService.subscribeToNotifications(
      fournisseur.id,
      (newNotifications) => {
        setNotifications(newNotifications);
      }
    );

    const unsubscribeUnreadCount = NotificationService.subscribeToUnreadCount(
      fournisseur.id,
      (count) => {
        setUnreadCount(count);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeUnreadCount();
    };
  }, [fournisseur?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!fournisseur?.id) return;
    
    try {
      await NotificationService.markAllAsRead(fournisseur.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Refresh notifications and stats
  const refresh = async () => {
    if (!fournisseur?.id) return;

    try {
      const [notificationsData, unreadCountData, statsData] = await Promise.all([
        NotificationService.getNotifications(fournisseur.id),
        NotificationService.getUnreadCount(fournisseur.id),
        NotificationService.getStats(fournisseur.id)
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      setStats(statsData);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    refresh
  };
};
