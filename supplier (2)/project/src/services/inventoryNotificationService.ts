import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/config';
import { EnhancedNotificationService } from './enhancedNotificationService';
import { Product } from '../models';

export class InventoryNotificationService {
  private static activeListeners = new Map<string, () => void>();

  // Initialize inventory monitoring for a supplier
  static initializeInventoryMonitoring(fournisseurId: string, fournisseurName: string): () => void {
    console.log(`🔄 [Inventory Monitor] Initializing for fournisseur: ${fournisseurId}`);

    // Clean up existing listener if any
    const existingUnsubscribe = this.activeListeners.get(fournisseurId);
    if (existingUnsubscribe) {
       existingUnsubscribe();
    }

    const productsQuery = query(
      collection(db, 'products'),
      where('FournisseurId', '==', fournisseurId)
    );

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const productData = { id: change.doc.id, ...change.doc.data() } as Product;
          await this.checkInventoryLevels(productData, fournisseurId, fournisseurName);
        }
      });
    });

    this.activeListeners.set(fournisseurId, unsubscribe);
    console.log(`✅ [Inventory Monitor] Monitoring active for fournisseur: ${fournisseurId}`);

    return () => {
      unsubscribe();
      this.activeListeners.delete(fournisseurId);
      console.log(`🧹 [Inventory Monitor] Stopped monitoring for fournisseur: ${fournisseurId}`);
    };
  }

  // Check inventory levels and create notifications
  private static async checkInventoryLevels(
    product: Product, 
    fournisseurId: string, 
    fournisseurName: string
  ): Promise<void> {
    const currentStock = parseInt(product.stockQuantity) || 0;
    const lowStockThreshold = 10; // Configurable threshold
    const criticalStockThreshold = 5;

    try {
      // Out of stock notification
      if (currentStock === 0 && product.isAvailable) {
        await EnhancedNotificationService.createInventoryNotification(
          fournisseurId,
          fournisseurName,
          'out_of_stock',
          {
            productId: product.id,
            productName: product.title,
            currentStock,
            unit: product.unit,
            lastStockUpdate: new Date().toISOString()
          }
        );
        console.log(`📢 [Inventory] Out of stock notification created for product: ${product.title}`);
      }
      // Critical stock notification
      else if (currentStock <= criticalStockThreshold && currentStock > 0) {
        await EnhancedNotificationService.createInventoryNotification(
          fournisseurId,
          fournisseurName,
          'critical_stock',
          {
            productId: product.id,
            productName: product.title,
            currentStock,
            threshold: criticalStockThreshold,
            unit: product.unit,
            urgency: 'critical'
          }
        );
        console.log(`⚠️ [Inventory] Critical stock notification created for product: ${product.title}`);
      }
      // Low stock notification
      else if (currentStock <= lowStockThreshold && currentStock > criticalStockThreshold) {
        await EnhancedNotificationService.createInventoryNotification(
          fournisseurId,
          fournisseurName,
          'low_inventory',
          {
            productId: product.id,
            productName: product.title,
            currentStock,
            threshold: lowStockThreshold,
            unit: product.unit,
            urgency: 'medium'
          }
        );
        console.log(`📊 [Inventory] Low stock notification created for product: ${product.title}`);
      }
    } catch (error) {
      console.error('Error creating inventory notification:', error);
    }
  }

  // Create restock reminder notifications
  static async createRestockReminders(fournisseurId: string, fournisseurName: string): Promise<void> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('FournisseurId', '==', fournisseurId)
      );
      
      const snapshot = await getDocs(productsQuery);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      
      const lowStockProducts = products.filter(product => {
        const stock = parseInt(product.stockQuantity) || 0;
        return stock <= 10 && stock > 0;
      });

      for (const product of lowStockProducts) {
        await EnhancedNotificationService.createInventoryNotification(
          fournisseurId,
          fournisseurName,
          'restock_reminder',
          {
            productId: product.id,
            productName: product.title,
            currentStock: parseInt(product.stockQuantity) || 0,
            unit: product.unit,
            suggestedRestockQuantity: 50, // Could be calculated based on sales velocity
            lastSaleDate: new Date().toISOString() // Would come from actual sales data
          }
        );
      }

      console.log(`📦 [Inventory] Created ${lowStockProducts.length} restock reminder notifications`);
    } catch (error) {
      console.error('Error creating restock reminders:', error);
    }
  }

  // Cleanup listeners
  static cleanup(): void {
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeListeners.clear();
    console.log('🧹 [Inventory Monitor] All listeners cleaned up');
  }

  // Get inventory alerts summary
  static async getInventoryAlertsSummary(fournisseurId: string): Promise<{
    outOfStock: number;
    lowStock: number;
    criticalStock: number;
    needsRestock: number;
  }> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('FournisseurId', '==', fournisseurId)
      );
      
      const snapshot = await getDocs(productsQuery);
      const products = snapshot.docs.map(doc => doc.data()) as Product[];
      
      const summary = {
        outOfStock: 0,
        lowStock: 0,
        criticalStock: 0,
        needsRestock: 0
      };

      products.forEach(product => {
        const stock = parseInt(product.stockQuantity) || 0;
        
        if (stock === 0) {
          summary.outOfStock++;
        } else if (stock <= 5) {
          summary.criticalStock++;
        } else if (stock <= 10) {
          summary.lowStock++;
        }
        
        if (stock <= 10) {
          summary.needsRestock++;
        }
      });

      return summary;
    } catch (error) {
      console.error('Error getting inventory alerts summary:', error);
      return { outOfStock: 0, lowStock: 0, criticalStock: 0, needsRestock: 0 };
    }
  }
}