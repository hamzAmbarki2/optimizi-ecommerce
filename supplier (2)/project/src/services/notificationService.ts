// Simple notification service for suppliers - focused on orders only
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/config';
import { Notification, NotificationStats } from '../types/notifications';

export class NotificationService {
  // Create a new order notification
  static async createOrderNotification(
    fournisseurId: string,
    orderId: string,
    customerName: string,
    customerEmail: string,
    total: number,
    itemCount: number
  ): Promise<void> {
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      type: 'order',
      title: 'Nouvelle commande reçue',
      message: `Nouvelle commande de ${customerName} - Total: TND${total.toFixed(2)}`,
      orderId,
      fournisseurId,
      isRead: false,
      orderData: {
        customerName,
        customerEmail,
        total,
        itemCount,
        status: 'pending'
      }
    };

    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  // Get notifications for a supplier (only unread ones)
  static async getNotifications(fournisseurId: string): Promise<Notification[]> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true
    });
  }

  // Mark all notifications as read for a supplier
  static async markAllAsRead(fournisseurId: string): Promise<void> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    
    for (const docSnapshot of snapshot.docs) {
      await updateDoc(doc(db, 'notifications', docSnapshot.id), { 
        isRead: true
      });
    }
  }

  // Get unread count
  static async getUnreadCount(fournisseurId: string): Promise<number> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.size;
  }

  // Get notification statistics
  static async getStats(fournisseurId: string): Promise<NotificationStats> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    const notifications = snapshot.docs.map(doc => doc.data()) as Notification[];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      archived: 0, // Not implemented yet
      byType: {},
      byPriority: {},
      recent: notifications.filter(n => new Date(n.createdAt) >= today).length,
      thisWeek: 0, // Not implemented yet
      thisMonth: 0, // Not implemented yet
      clickThroughRate: 0, // Not implemented yet
      averageReadTime: 0 // Not implemented yet
    };
  }

  // Real-time listener for new notifications (only unread)
  static subscribeToNotifications(
    fournisseurId: string,
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      callback(notifications);
    });
  }

  // Real-time listener for unread count
  static subscribeToUnreadCount(
    fournisseurId: string,
    callback: (count: number) => void
  ): Unsubscribe {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('isRead', '==', false)
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
      callback(snapshot.size);
    });
  }

  // Delete old notifications (older than 30 days)
  static async cleanupOldNotifications(fournisseurId: string): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('createdAt', '<', cutoffDate.toISOString())
    );

    const snapshot = await getDocs(notificationsQuery);
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, 'notifications', docSnapshot.id));
    }
  }

  // Format notification time for display
  static formatTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
    return date.toLocaleDateString('fr-FR');
  }
}
