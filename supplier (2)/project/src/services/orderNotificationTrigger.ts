import { collection, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';
import { db } from '../config/config';
import { supplierNotificationService } from './supplierNotificationService';
import { Order } from '../models';

/**
 * Service to automatically trigger supplier notifications when new orders are created
 */
export class OrderNotificationTrigger {
  private static instance: OrderNotificationTrigger;
  private activeListeners = new Map<string, Unsubscribe>();

  private constructor() {}

  public static getInstance(): OrderNotificationTrigger {
    if (!OrderNotificationTrigger.instance) {
      OrderNotificationTrigger.instance = new OrderNotificationTrigger();
    }
    return OrderNotificationTrigger.instance;
  }

  /**
   * Initialize order monitoring for a specific supplier
   */
  public initializeOrderMonitoring(fournisseurId: string): () => void {
    console.log(`🔄 [OrderNotificationTrigger] Initializing order monitoring for supplier: ${fournisseurId}`);

    // Clean up existing listener if any
    const existingUnsubscribe = this.activeListeners.get(fournisseurId);
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    // Set up real-time listener for new sub-orders
    const subOrdersQuery = query(
      collection(db, 'subOrders'),
      where('fournisseurId', '==', fournisseurId)
    );

    const unsubscribe = onSnapshot(subOrdersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          // New order detected
          const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
          console.log(`🆕 [OrderNotificationTrigger] New order detected: ${orderData.id}`);
          
          try {
            // Send notification to supplier
            const success = await supplierNotificationService.sendOrderNotification(orderData);
            
            if (success) {
              console.log(`✅ [OrderNotificationTrigger] Notification sent for order: ${orderData.id}`);
            } else {
              console.error(`❌ [OrderNotificationTrigger] Failed to send notification for order: ${orderData.id}`);
            }
          } catch (error) {
            console.error(`❌ [OrderNotificationTrigger] Error processing new order notification:`, error);
          }
        } else if (change.type === 'modified') {
          // Order status changed
          const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
          console.log(`🔄 [OrderNotificationTrigger] Order status changed: ${orderData.id} -> ${orderData.status}`);
          
          try {
            // Send status update notification to supplier
            const success = await supplierNotificationService.sendOrderNotification(orderData);
            
            if (success) {
              console.log(`✅ [OrderNotificationTrigger] Status update notification sent for order: ${orderData.id}`);
            } else {
              console.error(`❌ [OrderNotificationTrigger] Failed to send status update for order: ${orderData.id}`);
            }
          } catch (error) {
            console.error(`❌ [OrderNotificationTrigger] Error processing order status update:`, error);
          }
        }
      });
    }, (error) => {
      console.error('❌ [OrderNotificationTrigger] Error in order monitoring:', error);
    });

    this.activeListeners.set(fournisseurId, unsubscribe);
    console.log(`✅ [OrderNotificationTrigger] Order monitoring active for supplier: ${fournisseurId}`);

    return () => {
      unsubscribe();
      this.activeListeners.delete(fournisseurId);
      console.log(`🧹 [OrderNotificationTrigger] Stopped order monitoring for supplier: ${fournisseurId}`);
    };
  }

  /**
   * Initialize monitoring for all suppliers (admin use)
   */
  public initializeGlobalOrderMonitoring(): () => void {
    console.log(`🌐 [OrderNotificationTrigger] Initializing global order monitoring`);

    const subOrdersQuery = query(collection(db, 'subOrders'));

    const unsubscribe = onSnapshot(subOrdersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
          console.log(`🆕 [Global] New order detected: ${orderData.id} for supplier: ${orderData.fournisseurId}`);
          
          try {
            const success = await supplierNotificationService.sendOrderNotification(orderData);
            
            if (success) {
              console.log(`✅ [Global] Notification sent for order: ${orderData.id}`);
            } else {
              console.error(`❌ [Global] Failed to send notification for order: ${orderData.id}`);
            }
          } catch (error) {
            console.error(`❌ [Global] Error processing new order notification:`, error);
          }
        }
      });
    });

    return unsubscribe;
  }

  /**
   * Test the notification system
   */
  public async testNotificationSystem(supplierEmail: string, supplierName: string): Promise<boolean> {
    console.log(`🧪 [OrderNotificationTrigger] Testing notification system for: ${supplierEmail}`);
    
    try {
      const success = await supplierNotificationService.sendTestNotification(supplierEmail, supplierName);
      
      if (success) {
        console.log(`✅ [OrderNotificationTrigger] Test notification sent successfully`);
      } else {
        console.error(`❌ [OrderNotificationTrigger] Test notification failed`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ [OrderNotificationTrigger] Error testing notification system:`, error);
      return false;
    }
  }

  /**
   * Get monitoring status
   */
  public getMonitoringStatus(): {
    activeSuppliers: string[];
    totalListeners: number;
    isGlobalMonitoringActive: boolean;
  } {
    return {
      activeSuppliers: Array.from(this.activeListeners.keys()),
      totalListeners: this.activeListeners.size,
      isGlobalMonitoringActive: false // Would track global listener separately
    };
  }

  /**
   * Cleanup all listeners
   */
  public cleanup(): void {
    console.log(`🧹 [OrderNotificationTrigger] Cleaning up all listeners`);
    
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    
    this.activeListeners.clear();
    console.log(`✅ [OrderNotificationTrigger] All listeners cleaned up`);
  }
}

// Export singleton instance
export const orderNotificationTrigger = OrderNotificationTrigger.getInstance();