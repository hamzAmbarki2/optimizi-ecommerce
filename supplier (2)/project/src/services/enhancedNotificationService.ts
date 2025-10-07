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
  writeBatch,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/config';
import { EnhancedNotification, NotificationPreferences, NotificationFilter, NotificationStats } from '../types/notifications';

export class EnhancedNotificationService {
  // Create notification with enhanced features
  static async createNotification(notification: Omit<EnhancedNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if supplier has preferences for this notification type
      const preferences = await this.getNotificationPreferences(notification.fournisseurId);
      
      if (!this.shouldSendNotification(notification, preferences)) {
        console.log(`Notification blocked by user preferences: ${notification.type}/${notification.subType}`);
        return '';
      }

      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Send email if enabled
      if (preferences?.emailNotifications && notification.priority === 'high') {
        await this.sendEmailNotification(docRef.id, notification);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get notifications with advanced filtering and pagination
  static async getNotifications(
    fournisseurId: string,
    filter: NotificationFilter = {},
    limitCount: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ notifications: EnhancedNotification[], hasMore: boolean, lastDoc?: DocumentSnapshot }> {
    try {
      let notificationsQuery = query(
        collection(db, 'notifications'),
        where('fournisseurId', '==', fournisseurId)
      );

      // Apply filters
      if (filter.type) {
        notificationsQuery = query(notificationsQuery, where('type', '==', filter.type));
      }
      if (filter.subType) {
        notificationsQuery = query(notificationsQuery, where('subType', '==', filter.subType));
      }
      if (filter.priority) {
        notificationsQuery = query(notificationsQuery, where('priority', '==', filter.priority));
      }
      if (filter.isRead !== undefined) {
        notificationsQuery = query(notificationsQuery, where('isRead', '==', filter.isRead));
      }
      if (filter.isArchived !== undefined) {
        notificationsQuery = query(notificationsQuery, where('isArchived', '==', filter.isArchived));
      }

      // Add ordering and pagination
      notificationsQuery = query(
        notificationsQuery,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        notificationsQuery = query(notificationsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedNotification[];

      // Client-side filtering for date range and search
      let filteredNotifications = notifications;

      if (filter.dateFrom || filter.dateTo) {
        filteredNotifications = notifications.filter(notification => {
          const notificationDate = new Date(notification.createdAt);
          const fromDate = filter.dateFrom ? new Date(filter.dateFrom) : new Date(0);
          const toDate = filter.dateTo ? new Date(filter.dateTo) : new Date();
          return notificationDate >= fromDate && notificationDate <= toDate;
        });
      }

      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        filteredNotifications = filteredNotifications.filter(notification =>
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower)
        );
      }

      return {
        notifications: filteredNotifications,
        hasMore: snapshot.docs.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Notification preferences management
  static async getNotificationPreferences(fournisseurId: string): Promise<NotificationPreferences | null> {
    try {
      const preferencesQuery = query(
        collection(db, 'notificationPreferences'),
        where('fournisseurId', '==', fournisseurId)
      );
      
      const snapshot = await getDocs(preferencesQuery);
      
      if (!snapshot.empty) {
        return {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as NotificationPreferences;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  static async updateNotificationPreferences(
    fournisseurId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const existingPreferences = await this.getNotificationPreferences(fournisseurId);
      
      if (existingPreferences?.id) {
        await updateDoc(doc(db, 'notificationPreferences', existingPreferences.id), {
          ...preferences,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'notificationPreferences'), {
          fournisseurId,
          ...this.getDefaultPreferences(),
          ...preferences,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  // Bulk operations
  static async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    
    notificationIds.forEach(id => {
      const notificationRef = doc(db, 'notifications', id);
      batch.update(notificationRef, {
        isRead: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
  }

  static async archiveMultiple(notificationIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    
    notificationIds.forEach(id => {
      const notificationRef = doc(db, 'notifications', id);
      batch.update(notificationRef, {
        isArchived: true,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
  }

  static async deleteMultiple(notificationIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    
    notificationIds.forEach(id => {
      const notificationRef = doc(db, 'notifications', id);
      batch.delete(notificationRef);
    });

    await batch.commit();
  }

  // Analytics and statistics
  static async getNotificationStats(fournisseurId: string): Promise<NotificationStats> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('fournisseurId', '==', fournisseurId)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map(doc => doc.data()) as EnhancedNotification[];
      
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        archived: notifications.filter(n => n.isArchived).length,
        byType: {},
        byPriority: {},
        recent: notifications.filter(n => new Date(n.createdAt) > yesterday).length,
        thisWeek: notifications.filter(n => new Date(n.createdAt) > weekAgo).length,
        thisMonth: notifications.filter(n => new Date(n.createdAt) > monthAgo).length,
        clickThroughRate: 0,
        averageReadTime: 0
      };

      // Count by type
      notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      });

      // Calculate click-through rate
      const clickedNotifications = notifications.filter(n => n.clicked).length;
      stats.clickThroughRate = notifications.length > 0 ? (clickedNotifications / notifications.length) * 100 : 0;

      // Calculate average read time (simplified)
      const readNotifications = notifications.filter(n => n.isRead && n.readAt);
      if (readNotifications.length > 0) {
        const totalReadTime = readNotifications.reduce((sum, n) => {
          const created = new Date(n.createdAt).getTime();
          const read = new Date(n.readAt!).getTime();
          return sum + (read - created);
        }, 0);
        stats.averageReadTime = totalReadTime / readNotifications.length / (1000 * 60); // Convert to minutes
      }

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error('Failed to get notification statistics');
    }
  }

  // Specialized notification creators
  static async createOrderNotification(
    fournisseurId: string,
    fournisseurName: string,
    subType: string,
    orderData: any
  ): Promise<string> {
    const templates = {
      'new_order': {
        title: '🛍️ Nouvelle commande reçue!',
        message: `Nouvelle commande de ${orderData.userName} d'un montant de TND${orderData.total.toFixed(2)}`,
        priority: 'high' as const
      },
      'order_confirmed': {
        title: '✅ Commande confirmée',
        message: `La commande #${orderData.id.slice(-8)} a été confirmée`,
        priority: 'medium' as const
      },
      'order_shipped': {
        title: '🚚 Commande expédiée',
        message: `La commande #${orderData.id.slice(-8)} est en route vers ${orderData.userName}`,
        priority: 'medium' as const
      },
      'order_delivered': {
        title: '🎉 Commande livrée',
        message: `La commande #${orderData.id.slice(-8)} a été livrée avec succès`,
        priority: 'low' as const
      },
      'order_cancelled': {
        title: '❌ Commande annulée',
        message: `La commande #${orderData.id.slice(-8)} a été annulée`,
        priority: 'high' as const
      }
    };

    const template = templates[subType as keyof typeof templates];
    if (!template) {
      throw new Error(`Unknown order notification subtype: ${subType}`);
    }

    return await this.createNotification({
      type: 'order',
      subType,
      title: template.title,
      message: template.message,
      priority: template.priority,
      fournisseurId,
      fournisseurName,
      orderId: orderData.id,
      customerId: orderData.userId,
      isRead: false,
      isArchived: false,
      emailSent: false,
      smsSent: false,
      clicked: false,
      actionTaken: false,
      data: {
        customerName: orderData.userName,
        customerEmail: orderData.userEmail,
        orderTotal: orderData.total,
        itemCount: orderData.items?.length || 0,
        orderStatus: orderData.status,
        paymentStatus: orderData.paymentStatus
      }
    });
  }

  static async createPaymentNotification(
    fournisseurId: string,
    fournisseurName: string,
    subType: string,
    paymentData: any
  ): Promise<string> {
    const templates = {
      'payment_received': {
        title: '💰 Paiement reçu!',
        message: `Paiement de TND${paymentData.amount.toFixed(2)} reçu pour la commande #${paymentData.orderId.slice(-8)}`,
        priority: 'medium' as const
      },
      'payment_failed': {
        title: '❌ Paiement échoué',
        message: `Le paiement a échoué pour la commande #${paymentData.orderId.slice(-8)}`,
        priority: 'high' as const
      },
      'payment_pending': {
        title: '⏳ Paiement en attente',
        message: `Paiement en attente pour la commande #${paymentData.orderId.slice(-8)}`,
        priority: 'medium' as const
      },
      'refund_processed': {
        title: '💸 Remboursement traité',
        message: `Remboursement de TND${paymentData.amount.toFixed(2)} traité pour la commande #${paymentData.orderId.slice(-8)}`,
        priority: 'medium' as const
      }
    };

    const template = templates[subType as keyof typeof templates];
    if (!template) {
      throw new Error(`Unknown payment notification subtype: ${subType}`);
    }

    return await this.createNotification({
      type: 'payment',
      subType,
      title: template.title,
      message: template.message,
      priority: template.priority,
      fournisseurId,
      fournisseurName,
      orderId: paymentData.orderId,
      customerId: paymentData.customerId,
      isRead: false,
      isArchived: false,
      emailSent: false,
      smsSent: false,
      clicked: false,
      actionTaken: false,
      data: paymentData
    });
  }

  static async createInventoryNotification(
    fournisseurId: string,
    fournisseurName: string,
    subType: string,
    inventoryData: any
  ): Promise<string> {
    const templates = {
      'low_inventory': {
        title: '⚠️ Stock faible',
        message: `Le produit "${inventoryData.productName}" a un stock faible (${inventoryData.currentStock} restants)`,
        priority: 'medium' as const
      },
      'out_of_stock': {
        title: '🚫 Rupture de stock',
        message: `Le produit "${inventoryData.productName}" est en rupture de stock`,
        priority: 'high' as const
      },
      'restock_reminder': {
        title: '📦 Rappel de réapprovisionnement',
        message: `Il est temps de réapprovisionner "${inventoryData.productName}"`,
        priority: 'medium' as const
      }
    };

    const template = templates[subType as keyof typeof templates];
    if (!template) {
      throw new Error(`Unknown inventory notification subtype: ${subType}`);
    }

    return await this.createNotification({
      type: 'inventory',
      subType,
      title: template.title,
      message: template.message,
      priority: template.priority,
      fournisseurId,
      fournisseurName,
      productId: inventoryData.productId,
      isRead: false,
      isArchived: false,
      emailSent: false,
      smsSent: false,
      clicked: false,
      actionTaken: false,
      data: inventoryData
    });
  }

  static async createProductNotification(
    fournisseurId: string,
    fournisseurName: string,
    subType: string,
    productData: any
  ): Promise<string> {
    const templates = {
      'review_received': {
        title: '⭐ Nouvel avis client',
        message: `Nouvel avis ${productData.rating}/5 pour "${productData.productName}"`,
        priority: 'low' as const
      },
      'performance_update': {
        title: '📈 Mise à jour des performances',
        message: `Rapport de performance disponible pour "${productData.productName}"`,
        priority: 'low' as const
      }
    };

    const template = templates[subType as keyof typeof templates];
    if (!template) {
      throw new Error(`Unknown product notification subtype: ${subType}`);
    }

    return await this.createNotification({
      type: 'product',
      subType,
      title: template.title,
      message: template.message,
      priority: template.priority,
      fournisseurId,
      fournisseurName,
      productId: productData.productId,
      customerId: productData.customerId,
      isRead: false,
      isArchived: false,
      emailSent: false,
      smsSent: false,
      clicked: false,
      actionTaken: false,
      data: productData
    });
  }

  // Advanced notification actions
  static async markAsClicked(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      clicked: true,
      clickedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static async markActionTaken(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      actionTaken: true,
      actionTakenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static async archiveNotification(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isArchived: true,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static async unarchiveNotification(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isArchived: false,
      archivedAt: null,
      updatedAt: new Date().toISOString()
    });
  }

  // Email notification using SupplierEmailService
  private static async sendEmailNotification(notificationId: string, notification: any): Promise<void> {
    try {
      console.log(`📧 Sending email notification: ${notification.title}`);
      
      // Update notification to mark email as sent
      await updateDoc(doc(db, 'notifications', notificationId), {
        emailSent: true,
        emailSentAt: new Date().toISOString()
      });
      
      // Import and use the supplier email service
      const { supplierEmailService } = await import('./supplierEmailService');
      
      // Initialize the email service if not already done
      supplierEmailService.initialize();
      
      // Check if email service is configured
      if (!supplierEmailService.isConfigured()) {
        console.warn('Supplier email service not configured. Please set VITE_EMAIL_BACKEND_URL to your email backend.');
        return;
      }
      
      // If this is an order notification, send order details email
      if (notification.type === 'order' && notification.orderData) {
        // Create a mock order object from notification data for email
        const mockOrder = {
          id: notification.orderId || notification.id,
          masterOrderId: notification.orderId || notification.id,
          fournisseurId: notification.fournisseurId,
          fournisseurName: notification.fournisseurName || 'Fournisseur',
          userId: notification.orderData.customerId || 'unknown',
          userEmail: notification.orderData.customerEmail,
          userName: notification.orderData.customerName,
          userPhone: notification.orderData.customerPhone || '',
          subtotal: notification.orderData.subtotal || 0,
          deliveryFee: 0,
          tax: 0,
          total: notification.orderData.total,
          status: notification.orderData.status || 'pending',
          paymentStatus: 'pending' as const,
          paymentMethod: 'unknown',
          deliveryAddress: {
            street: notification.orderData.deliveryAddress?.street || 'Adresse non spécifiée',
            city: notification.orderData.deliveryAddress?.city || 'Ville non spécifiée',
            postalCode: notification.orderData.deliveryAddress?.postalCode || '00000',
            country: notification.orderData.deliveryAddress?.country || 'Pays non spécifié'
          },
          orderNotes: notification.orderData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: notification.orderData.items || []
        };
        
        // Send the order notification email
        await supplierEmailService.sendOrderNotification(mockOrder);
      }
      
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Helper methods
  private static shouldSendNotification(
    notification: any, 
    preferences: NotificationPreferences | null
  ): boolean {
    if (!preferences) return true; // Send if no preferences set
    
    // Check if in-app notifications are enabled
    if (!preferences.inAppNotifications) return false;
    
    // Check quiet hours
    if (preferences.quietHoursEnabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= preferences.quietHoursStart && currentTime <= preferences.quietHoursEnd) {
        return notification.priority === 'high'; // Only high priority during quiet hours
      }
    }
    
    // Check specific notification type preferences
    const typePreferenceMap: Record<string, keyof NotificationPreferences> = {
      'order/new_order': 'newOrderReceived',
      'order/order_confirmed': 'orderStatusChanged',
      'order/order_shipped': 'orderStatusChanged',
      'order/order_delivered': 'orderStatusChanged',
      'order/order_cancelled': 'orderCancelled',
      'payment/payment_received': 'paymentReceived',
      'payment/payment_failed': 'paymentFailed',
      'payment/payment_pending': 'paymentPending',
      'payment/refund_processed': 'refundProcessed',
      'inventory/low_inventory': 'lowInventoryAlert',
      'inventory/out_of_stock': 'outOfStockAlert',
      'inventory/restock_reminder': 'restockReminder',
      'product/review_received': 'productReviewReceived',
      'system/maintenance': 'systemMaintenance',
      'system/policy_changes': 'policyChanges'
    };
    
    const preferenceKey = typePreferenceMap[`${notification.type}/${notification.subType}`];
    if (preferenceKey && preferences[preferenceKey] === false) {
      return false;
    }
    
    return true;
  }

  private static getDefaultPreferences(): Omit<NotificationPreferences, 'fournisseurId' | 'createdAt' | 'updatedAt'> {
    return {
      newOrderReceived: true,
      orderStatusChanged: true,
      orderCancelled: true,
      orderModified: true,
      paymentReceived: true,
      paymentFailed: true,
      paymentPending: true,
      refundProcessed: true,
      lowInventoryAlert: true,
      outOfStockAlert: true,
      restockReminder: true,
      productReviewReceived: true,
      productPerformanceUpdate: false,
      accountVerificationUpdate: true,
      profileUpdateRequired: true,
      promotionalCampaignUpdate: false,
      salesReportReady: false,
      systemMaintenance: true,
      policyChanges: true,
      securityAlerts: true,
      emailNotifications: true,
      inAppNotifications: true,
      smsNotifications: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      instantNotifications: true,
      dailyDigest: false,
      weeklyDigest: false
    };
  }

  // Real-time subscriptions
  static subscribeToNotifications(
    fournisseurId: string,
    filter: NotificationFilter = {},
    callback: (notifications: EnhancedNotification[]) => void
  ): Unsubscribe {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('fournisseurId', '==', fournisseurId),
      where('isArchived', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedNotification[];
      
      callback(notifications);
    });
  }

  // Cleanup old notifications
  static async cleanupOldNotifications(fournisseurId: string, daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('fournisseurId', '==', fournisseurId),
        where('isArchived', '==', true),
        where('archivedAt', '<', cutoffDate.toISOString())
      );

      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach(docSnapshot => {
        batch.delete(doc(db, 'notifications', docSnapshot.id));
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}