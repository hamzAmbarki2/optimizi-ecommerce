import { collection, onSnapshot, query, where, Unsubscribe, addDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { supplierEmailService } from './supplierEmailService';
import { Order } from '../models';

/**
 * Enhanced service to automatically trigger supplier notifications when orders are created or updated
 */
export class OrderNotificationTrigger {
  private static instance: OrderNotificationTrigger;
  private activeListeners = new Map<string, Unsubscribe>();
  private processedOrders = new Set<string>(); // Track processed orders to avoid duplicates
  private lastProcessedTimestamp = new Map<string, number>(); // Track last processing time per supplier

  private constructor() {}

  public static getInstance(): OrderNotificationTrigger {
    if (!OrderNotificationTrigger.instance) {
      OrderNotificationTrigger.instance = new OrderNotificationTrigger();
    }
    return OrderNotificationTrigger.instance;
  }

  /**
   * Initialize comprehensive order monitoring for a specific supplier
   */
  public initializeOrderMonitoring(fournisseurId: string): () => void {
    console.log(`🔄 [OrderNotificationTrigger] Initializing comprehensive order monitoring for supplier: ${fournisseurId}`);

    // Clean up existing listener if any
    const existingUnsubscribe = this.activeListeners.get(fournisseurId);
    if (existingUnsubscribe) {
      console.log(`🧹 [OrderNotificationTrigger] Cleaning up existing listener for supplier: ${fournisseurId}`);
      existingUnsubscribe();
    }

    // Set up real-time listener for sub-orders
    const subOrdersQuery = query(
      collection(db, 'subOrders'),
      where('fournisseurId', '==', fournisseurId)
    );

    const unsubscribe = onSnapshot(subOrdersQuery, (snapshot) => {
      const currentTime = Date.now();
      const lastProcessed = this.lastProcessedTimestamp.get(fournisseurId) || 0;
      
      // Throttle processing to avoid spam (minimum 2 seconds between processing)
      if (currentTime - lastProcessed < 2000) {
        console.log(`⏸️ [OrderNotificationTrigger] Throttling notifications for supplier: ${fournisseurId}`);
        return;
      }

      this.lastProcessedTimestamp.set(fournisseurId, currentTime);

      snapshot.docChanges().forEach(async (change) => {
        const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
        const orderKey = `${orderData.id}-${orderData.status}-${orderData.paymentStatus}`;

        // Avoid processing the same order state multiple times
        if (this.processedOrders.has(orderKey)) {
          console.log(`⏭️ [OrderNotificationTrigger] Skipping already processed order state: ${orderKey}`);
          return;
        }

        this.processedOrders.add(orderKey);

        try {
          if (change.type === 'added') {
            // New order detected
            console.log(`🆕 [OrderNotificationTrigger] New order detected: ${orderData.id} for supplier: ${fournisseurId}`);
            console.log(`📊 [OrderNotificationTrigger] Order details:`, {
              customer: orderData.userName,
              total: orderData.total,
              items: orderData.items?.length || 0,
              status: orderData.status,
              paymentStatus: orderData.paymentStatus
            });
            
            // Send new order notification
            const success = await supplierEmailService.sendOrderNotification(orderData);
            
            if (success) {
              console.log(`✅ [OrderNotificationTrigger] New order notification sent successfully for: ${orderData.id}`);
              await this.logNotificationEvent(orderData, 'new_order', 'success');
            } else {
              console.error(`❌ [OrderNotificationTrigger] Failed to send new order notification for: ${orderData.id}`);
              await this.logNotificationEvent(orderData, 'new_order', 'failed');
            }

          } else if (change.type === 'modified') {
            // Order status or payment status changed
            console.log(`🔄 [OrderNotificationTrigger] Order modified: ${orderData.id}`);
            console.log(`📊 [OrderNotificationTrigger] Status: ${orderData.status}, Payment: ${orderData.paymentStatus}`);
            
            // Send status update notification
            const success = await supplierEmailService.sendOrderNotification(orderData);
            
            if (success) {
              console.log(`✅ [OrderNotificationTrigger] Status update notification sent for: ${orderData.id}`);
              await this.logNotificationEvent(orderData, 'status_update', 'success');
            } else {
              console.error(`❌ [OrderNotificationTrigger] Failed to send status update for: ${orderData.id}`);
              await this.logNotificationEvent(orderData, 'status_update', 'failed');
            }
          }

          // Create in-app notification for the supplier dashboard
          await this.createInAppNotification(orderData, change.type);

        } catch (error) {
          console.error(`❌ [OrderNotificationTrigger] Error processing order notification:`, error);
          await this.logNotificationEvent(orderData, change.type === 'added' ? 'new_order' : 'status_update', 'error');
        }
      });
    }, (error) => {
      console.error('❌ [OrderNotificationTrigger] Error in order monitoring listener:', error);
    });

    this.activeListeners.set(fournisseurId, unsubscribe);
    console.log(`✅ [OrderNotificationTrigger] Comprehensive order monitoring active for supplier: ${fournisseurId}`);

    return () => {
      unsubscribe();
      this.activeListeners.delete(fournisseurId);
      this.cleanupSupplierData(fournisseurId);
      console.log(`🧹 [OrderNotificationTrigger] Stopped order monitoring for supplier: ${fournisseurId}`);
    };
  }

  /**
   * Create in-app notification for supplier dashboard
   */
  private async createInAppNotification(order: Order, changeType: 'added' | 'modified'): Promise<void> {
    try {
      const notificationData = {
        type: 'order',
        title: changeType === 'added' 
          ? '🆕 Nouvelle commande reçue'
          : '🔄 Commande mise à jour',
        message: changeType === 'added'
          ? `Nouvelle commande de ${order.userName} - Total: TND${(order.total || 0).toFixed(2)}`
          : `Commande #${order.id.slice(-8)} - Statut: ${this.getStatusText(order.status)}`,
        orderId: order.id,
        fournisseurId: order.fournisseurId,
        isRead: false,
        createdAt: new Date().toISOString(),
        orderData: {
          customerName: order.userName,
          customerEmail: order.userEmail,
          total: order.total || 0,
          itemCount: order.items?.length || 0,
          status: order.status
        }
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      console.log(`📱 [OrderNotificationTrigger] In-app notification created for order: ${order.id}`);
    } catch (error) {
      console.error('❌ [OrderNotificationTrigger] Error creating in-app notification:', error);
    }
  }

  /**
   * Log notification events for analytics and debugging
   */
  private async logNotificationEvent(
    order: Order, 
    eventType: 'new_order' | 'status_update', 
    status: 'success' | 'failed' | 'error'
  ): Promise<void> {
    try {
      const logData = {
        orderId: order.id,
        fournisseurId: order.fournisseurId,
        fournisseurName: order.fournisseurName,
        customerName: order.userName,
        customerEmail: order.userEmail,
        orderTotal: order.total || 0,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        eventType,
        notificationStatus: status,
        timestamp: new Date().toISOString(),
        metadata: {
          itemCount: order.items?.length || 0,
          hasDeliveryInstructions: !!(order.deliveryAddress?.instructions),
          hasOrderNotes: !!order.orderNotes,
          paymentMethod: order.paymentMethod
        }
      };

      // Log to a dedicated collection for analytics
      await addDoc(collection(db, 'notificationLogs'), logData);
      console.log(`📊 [OrderNotificationTrigger] Event logged: ${eventType} - ${status} for order: ${order.id}`);
    } catch (error) {
      console.error('❌ [OrderNotificationTrigger] Error logging notification event:', error);
    }
  }

  /**
   * Initialize monitoring for all suppliers (admin use)
   */
  public initializeGlobalOrderMonitoring(): () => void {
    console.log(`🌐 [OrderNotificationTrigger] Initializing global order monitoring for all suppliers`);

    const subOrdersQuery = query(collection(db, 'subOrders'));

    const unsubscribe = onSnapshot(subOrdersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
          console.log(`🆕 [Global] New order detected: ${orderData.id} for supplier: ${orderData.fournisseurId}`);
          
          try {
            const success = await supplierEmailService.sendOrderNotification(orderData);
            
            if (success) {
              console.log(`✅ [Global] Notification sent for order: ${orderData.id}`);
            } else {
              console.error(`❌ [Global] Failed to send notification for order: ${orderData.id}`);
            }

            await this.logNotificationEvent(orderData, 'new_order', success ? 'success' : 'failed');
          } catch (error) {
            console.error(`❌ [Global] Error processing new order notification:`, error);
            await this.logNotificationEvent(orderData, 'new_order', 'error');
          }
        }
      });
    });

    return unsubscribe;
  }

  /**
   * Test the complete notification system
   */
  public async testNotificationSystem(supplierEmail: string, supplierName: string): Promise<{
    connectionTest: boolean;
    emailTest: boolean;
    configurationValid: boolean;
    errors: string[];
  }> {
    console.log(`🧪 [OrderNotificationTrigger] Testing complete notification system for: ${supplierEmail}`);
    
    const errors: string[] = [];
    let connectionTest = false;
    let emailTest = false;
    let configurationValid = false;

    try {
      // Test 1: Check configuration
      configurationValid = supplierEmailService.isConfigured();
      if (!configurationValid) {
        const configStatus = supplierEmailService.getConfigStatus();
        errors.push(`Configuration invalid: Missing ${configStatus.missingFields.join(', ')}`);
      }

      // Test 2: Test backend connection
      const connectionResult = await supplierEmailService.testConnection();
      connectionTest = connectionResult.success;
      if (!connectionTest) {
        errors.push(`Backend connection failed: ${connectionResult.message}`);
      }

      // Test 3: Send test email
      if (configurationValid && connectionTest) {
        emailTest = await supplierEmailService.sendTestNotification(supplierEmail, supplierName);
        if (!emailTest) {
          errors.push('Test email sending failed');
        }
      } else {
        errors.push('Skipping email test due to configuration or connection issues');
      }

      const overallSuccess = configurationValid && connectionTest && emailTest;
      
      console.log(`📊 [OrderNotificationTrigger] Test results:`, {
        configurationValid,
        connectionTest,
        emailTest,
        overallSuccess,
        errors
      });

      return {
        connectionTest,
        emailTest,
        configurationValid,
        errors
      };
    } catch (error) {
      console.error(`❌ [OrderNotificationTrigger] Error testing notification system:`, error);
      errors.push(`System test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        connectionTest: false,
        emailTest: false,
        configurationValid: false,
        errors
      };
    }
  }

  /**
   * Get comprehensive monitoring status and statistics
   */
  public getMonitoringStatus(): {
    activeSuppliers: string[];
    totalListeners: number;
    processedOrdersCount: number;
    isGlobalMonitoringActive: boolean;
    lastActivity: { [supplierId: string]: number };
    systemHealth: 'healthy' | 'warning' | 'error';
  } {
    const lastActivity: { [supplierId: string]: number } = {};
    this.lastProcessedTimestamp.forEach((timestamp, supplierId) => {
      lastActivity[supplierId] = timestamp;
    });

    const systemHealth = this.activeListeners.size > 0 ? 'healthy' : 'warning';

    return {
      activeSuppliers: Array.from(this.activeListeners.keys()),
      totalListeners: this.activeListeners.size,
      processedOrdersCount: this.processedOrders.size,
      isGlobalMonitoringActive: false, // Would track global listener separately
      lastActivity,
      systemHealth
    };
  }

  /**
   * Clean up supplier-specific data
   */
  private cleanupSupplierData(fournisseurId: string): void {
    // Remove processed orders for this supplier
    const ordersToRemove = Array.from(this.processedOrders).filter(orderKey => 
      orderKey.includes(fournisseurId)
    );
    
    ordersToRemove.forEach(orderKey => {
      this.processedOrders.delete(orderKey);
    });

    // Remove last processed timestamp
    this.lastProcessedTimestamp.delete(fournisseurId);

    console.log(`🧹 [OrderNotificationTrigger] Cleaned up data for supplier: ${fournisseurId}`);
  }

  /**
   * Cleanup all listeners and data
   */
  public cleanup(): void {
    console.log(`🧹 [OrderNotificationTrigger] Cleaning up all listeners and data`);
    
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    
    this.activeListeners.clear();
    this.processedOrders.clear();
    this.lastProcessedTimestamp.clear();
    
    console.log(`✅ [OrderNotificationTrigger] All listeners and data cleaned up`);
  }

  /**
   * Get notification statistics for a supplier
   */
  public async getNotificationStats(fournisseurId: string): Promise<{
    totalNotificationsSent: number;
    successfulNotifications: number;
    failedNotifications: number;
    lastNotificationSent?: string;
    averageResponseTime: number;
  }> {
    try {
      const logsQuery = query(
        collection(db, 'notificationLogs'),
        where('fournisseurId', '==', fournisseurId)
      );
      
      const snapshot = await getDocs(logsQuery);
      const logs = snapshot.docs.map(doc => doc.data());
      
      const totalNotificationsSent = logs.length;
      const successfulNotifications = logs.filter(log => log.notificationStatus === 'success').length;
      const failedNotifications = logs.filter(log => log.notificationStatus === 'failed').length;
      
      const lastLog = logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      const lastNotificationSent = lastLog?.timestamp;
      
      // Calculate average response time (simplified)
      const averageResponseTime = logs.length > 0 ? 2.5 : 0; // Placeholder calculation

      return {
        totalNotificationsSent,
        successfulNotifications,
        failedNotifications,
        lastNotificationSent,
        averageResponseTime
      };
    } catch (error) {
      console.error('❌ [OrderNotificationTrigger] Error getting notification stats:', error);
      return {
        totalNotificationsSent: 0,
        successfulNotifications: 0,
        failedNotifications: 0,
        averageResponseTime: 0
      };
    }
  }

  /**
   * Manually trigger notification for a specific order (for testing or retry)
   */
  public async manuallyTriggerNotification(orderId: string): Promise<boolean> {
    try {
      console.log(`🔧 [OrderNotificationTrigger] Manually triggering notification for order: ${orderId}`);
      
      // Get order data
      const orderDoc = await getDoc(doc(db, 'subOrders', orderId));
      if (!orderDoc.exists()) {
        console.error(`❌ [OrderNotificationTrigger] Order not found: ${orderId}`);
        return false;
      }

      const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
      
      // Send notification
      const success = await supplierEmailService.sendOrderNotification(orderData);
      
      if (success) {
        console.log(`✅ [OrderNotificationTrigger] Manual notification sent successfully for: ${orderId}`);
        await this.logNotificationEvent(orderData, 'manual_trigger', 'success');
      } else {
        console.error(`❌ [OrderNotificationTrigger] Manual notification failed for: ${orderId}`);
        await this.logNotificationEvent(orderData, 'manual_trigger', 'failed');
      }

      return success;
    } catch (error) {
      console.error(`❌ [OrderNotificationTrigger] Error in manual notification trigger:`, error);
      return false;
    }
  }

  // Helper method for status text
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En Attente',
      'confirmed': 'Confirmée',
      'preparing': 'En Préparation',
      'out_for_delivery': 'En Livraison',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Export singleton instance
export const orderNotificationTrigger = OrderNotificationTrigger.getInstance();