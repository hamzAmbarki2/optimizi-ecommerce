import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/config';
import { ProductService } from './productService';
import { EnhancedNotificationService } from './enhancedNotificationService';

const MASTER_ORDERS_COLLECTION = 'masterOrders';
const SUB_ORDERS_COLLECTION = 'subOrders';

interface MasterOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;

  // Totaux globaux
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;

  // Informations de commande
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryAddress: any;
  promoCode: string;
  orderNotes: string;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;

  // Relations
  subOrderIds: string[];
  fournisseurCount: number;
}

interface SubOrder {
  id: string;
  masterOrderId: string;
  fournisseurId: string;
  fournisseurName: string;

  // Informations client (dupliquées pour faciliter les requêtes)
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;

  // Produits de ce fournisseur uniquement
  items: any[];

  // Totaux pour ce fournisseur
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;

  // Statut spécifique au fournisseur
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Informations de livraison (dupliquées)
  paymentMethod: string;
  deliveryAddress: any;
  orderNotes: string;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
}

export const masterOrderService = {
  // Get master order by ID
  async getMasterOrderById(orderId: string): Promise<MasterOrder | null> {
    try {
      const orderRef = doc(db, MASTER_ORDERS_COLLECTION, orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        return {
          id: orderSnap.id,
          ...data
        } as MasterOrder;
      }

      return null;
    } catch (error) {
      console.error('Error fetching master order:', error);
      throw new Error('Failed to fetch order');
    }
  },

  // Get sub-orders by master order ID
  async getSubOrdersByMasterOrderId(masterOrderId: string): Promise<SubOrder[]> {
    try {
      const subOrdersRef = collection(db, SUB_ORDERS_COLLECTION);
      const q = query(
          subOrdersRef,
          where('masterOrderId', '==', masterOrderId)
      );
      const querySnapshot = await getDocs(q);

      const subOrders: SubOrder[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subOrders.push({
          id: doc.id,
          ...data
        } as SubOrder);
      });

      // Sort by createdAt in memory
      subOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });

      return subOrders;
    } catch (error) {
      console.error('Error fetching sub-orders:', error);
      throw new Error('Failed to fetch sub-orders');
    }
  },

  // Update sub-order status and sync master order
  async updateSubOrderStatus(
      subOrderId: string,
      status: SubOrder['status'],
      paymentStatus?: SubOrder['paymentStatus']
  ): Promise<void> {
    try {
      console.log(`🔄 [Fournisseur] Updating subOrder ${subOrderId} to status: ${status}, paymentStatus: ${paymentStatus}`);

      // Get the sub-order first to check current status and get order items
      const subOrderRef = doc(db, SUB_ORDERS_COLLECTION, subOrderId);
      const subOrderSnap = await getDoc(subOrderRef);

      if (!subOrderSnap.exists()) {
        console.error(`❌ [Fournisseur] SubOrder ${subOrderId} not found`);
        throw new Error('SubOrder not found');
      }

      const currentSubOrder = subOrderSnap.data() as SubOrder;
      const previousStatus = currentSubOrder.status;

      console.log(`📊 [Fournisseur] SubOrder ${subOrderId} status change: ${previousStatus} → ${status}`);

      // Check if we need to decrement stock (when status changes to "out_for_delivery")
      const shouldDecrementStock = status === 'out_for_delivery' && previousStatus !== 'out_for_delivery';

      if (shouldDecrementStock) {
        console.log(`🔄 [Stock] Status changed to "out_for_delivery", decrementing stock for subOrder ${subOrderId}`);

        // Prepare items for stock decrement
        const stockItems = currentSubOrder.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }));

        console.log(`📦 [Stock] Items to decrement:`, stockItems);

        // Decrement stock for all items in this sub-order
        const stockResult = await ProductService.decrementMultipleProductsStock(stockItems);

        if (!stockResult.success) {
          console.error(`❌ [Stock] Failed to decrement stock for subOrder ${subOrderId}:`, stockResult.errors);
          // You can choose to either throw an error or continue with status update
          // For now, we'll log the error but continue with the status update
          console.warn(`⚠️ [Stock] Continuing with status update despite stock decrement errors`);
        } else {
          console.log(`✅ [Stock] Successfully decremented stock for all items in subOrder ${subOrderId}`);
        }
      }

      // Update sub-order status
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      if (status === 'confirmed') {
        updateData.confirmedAt = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }

      await updateDoc(subOrderRef, updateData);
      console.log(`✅ [Fournisseur] SubOrder ${subOrderId} updated successfully`);

      // Create notification for status change
      if (status !== currentSubOrder.status) {
        try {
          await EnhancedNotificationService.createOrderNotification(
              currentSubOrder.fournisseurId,
              currentSubOrder.fournisseurName || 'Supplier',
              this.getOrderNotificationSubType(status),
              currentSubOrder
          );
        } catch (notificationError) {
          console.error('Error creating order status notification:', notificationError);
        }
      }

      // Create notification for payment status change
      if (paymentStatus && paymentStatus !== currentSubOrder.paymentStatus) {
        try {
          await EnhancedNotificationService.createPaymentNotification(
              currentSubOrder.fournisseurId,
              currentSubOrder.fournisseurName || 'Supplier',
              this.getPaymentNotificationSubType(paymentStatus),
              {
                orderId: currentSubOrder.id,
                customerId: currentSubOrder.userId,
                amount: currentSubOrder.total,
                paymentMethod: currentSubOrder.paymentMethod
              }
          );
        } catch (notificationError) {
          console.error('Error creating payment status notification:', notificationError);
        }
      }

      // Sync master order status
      console.log(`🔗 [Fournisseur] Found masterOrderId: ${currentSubOrder.masterOrderId}, triggering sync...`);
      await this.syncMasterOrderStatus(currentSubOrder.masterOrderId);
    } catch (error) {
      console.error('❌ [Fournisseur] Error updating sub-order status:', error);
      throw new Error('Failed to update order status');
    }
  },

  // Sync master order status based on sub-orders
  // New simplified logic: if all subOrders have the same status, update masterOrder to that status
  async syncMasterOrderStatus(masterOrderId: string): Promise<void> {
    try {
      console.log(`🔄 [Fournisseur] Starting sync for masterOrder: ${masterOrderId}`);

      // Get all subOrders related to this masterOrder by their ID
      const subOrders = await this.getSubOrdersByMasterOrderId(masterOrderId);
      console.log(`📋 [Fournisseur] Found ${subOrders.length} subOrders for masterOrder ${masterOrderId}`);

      if (subOrders.length === 0) {
        console.log(`⚠️ [Fournisseur] No subOrders found for masterOrder ${masterOrderId}, skipping sync`);
        return;
      }

      // Get the status of all subOrders
      const statuses = subOrders.map(order => order.status);
      const paymentStatuses = subOrders.map(order => order.paymentStatus);

      console.log(`📊 [Fournisseur] SubOrder statuses:`, statuses);
      console.log(`💳 [Fournisseur] SubOrder payment statuses:`, paymentStatuses);

      // Check if all subOrders have the same status
      const allStatusesSame = statuses.every(status => status === statuses[0]);
      const allPaymentStatusesSame = paymentStatuses.every(status => status === paymentStatuses[0]);

      console.log(`🔍 [Fournisseur] All statuses same: ${allStatusesSame} (${statuses[0]})`);
      console.log(`🔍 [Fournisseur] All payment statuses same: ${allPaymentStatusesSame} (${paymentStatuses[0]})`);

      // Only update masterOrder if all subOrders have the same status
      if (allStatusesSame || allPaymentStatusesSame) {
        const masterOrderRef = doc(db, MASTER_ORDERS_COLLECTION, masterOrderId);
        const updateData: any = {
          updatedAt: new Date().toISOString()
        };

        // Update status if all subOrders have the same status
        if (allStatusesSame) {
          updateData.status = statuses[0];
          console.log(`✅ [Fournisseur] Will update masterOrder status to: ${statuses[0]}`);

          // Set timestamp fields based on the new status
          if (statuses[0] === 'confirmed') {
            updateData.confirmedAt = new Date().toISOString();
          } else if (statuses[0] === 'delivered') {
            updateData.deliveredAt = new Date().toISOString();
          }
        }

        // Update payment status if all subOrders have the same payment status
        if (allPaymentStatusesSame) {
          updateData.paymentStatus = paymentStatuses[0];
          console.log(`✅ [Fournisseur] Will update masterOrder paymentStatus to: ${paymentStatuses[0]}`);
        }

        await updateDoc(masterOrderRef, updateData);

        console.log(`🎉 [Fournisseur] Master order ${masterOrderId} updated successfully:`, updateData);

        // Notify customer by email about master order status/payment update
        try {
          const masterSnap = await getDoc(masterOrderRef);
          if (masterSnap.exists()) {
            const masterData: any = masterSnap.data();
            const userEmail = masterData.userEmail;
            const userName = masterData.userName || masterData.userFullName || '';

            if (userEmail) {
              const backendUrl = (import.meta.env.VITE_EMAIL_BACKEND_URL || '').toString();
              if (!backendUrl) {
                console.warn('VITE_EMAIL_BACKEND_URL not configured — cannot send client email notification');
              } else {
                const orderNumber = (masterSnap.id || masterOrderId).slice(-8).toUpperCase();
                const subjectParts: string[] = [];
                if (updateData.status) subjectParts.push(`Statut: ${updateData.status}`);
                if (updateData.paymentStatus) subjectParts.push(`Paiement: ${updateData.paymentStatus}`);
                const subject = `Mise à jour commande #${orderNumber} — ${subjectParts.join(' | ') || 'Mise à jour'}`;

                const message = `Bonjour ${userName || 'client'},\n\nVotre commande #${orderNumber} a été mise à jour.\n\n${updateData.status ? `Nouveau statut: ${updateData.status}\n` : ''}${updateData.paymentStatus ? `Statut de paiement: ${updateData.paymentStatus}\n` : ''}\nVous pouvez consulter les détails de votre commande dans l'application.\n\nCordialement,\nL'équipe Optimizi`;

                try {
                  const resp = await fetch(`${backendUrl}/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to_email: userEmail,
                      to_name: userName,
                      subject,
                      message,
                      order: {
                        id: masterSnap.id,
                        status: updateData.status,
                        paymentStatus: updateData.paymentStatus
                      }
                    })
                  });

                  if (!resp.ok) {
                    const text = await resp.text().catch(() => '');
                    console.error('❌ [Fournisseur] Failed to POST client email to backend:', resp.status, text);
                  } else {
                    console.log('✉️ [Fournisseur] Client email notification posted to backend successfully');
                  }
                } catch (err) {
                  console.error('❌ [Fournisseur] Error sending client email via backend:', err);
                }
              }
            } else {
              console.log(`ℹ️ [Fournisseur] Master order ${masterOrderId} has no userEmail — skipping client email`);
            }
          }
        } catch (err) {
          console.error('❌ [Fournisseur] Error fetching master order for notification:', err);
        }
      } else {
        console.log(`⏸️ [Fournisseur] Master order ${masterOrderId} not updated - subOrders have different statuses`);
      }
    } catch (error) {
      console.error('❌ [Fournisseur] Error syncing master order status:', error);
      throw new Error('Failed to sync master order status');
    }
  },

  // CORRIGÉ : La logique de décrémentation de stock a été supprimée de cette fonction pour éviter la double décrémentation.
  initializeStockDecrementListener(fournisseurId: string): () => void {
    console.log(`🔄 [Stock Listener] Initializing stock decrement listener for fournisseur: ${fournisseurId}`);

    const subOrdersRef = collection(db, SUB_ORDERS_COLLECTION);
    const q = query(
        subOrdersRef,
        where('fournisseurId', '==', fournisseurId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const subOrderData = change.doc.data() as SubOrder;
          const subOrderId = change.doc.id;

          console.log(`🔄 [Stock Listener] SubOrder ${subOrderId} modified. No stock decrement action taken here to prevent duplication.`);

          // La logique de décrémentation de stock est maintenant gérée exclusivement dans `updateSubOrderStatus`.
          // Cet écouteur peut être utilisé pour d'autres actions réactives, comme des notifications.
        }
      });
    }, (error) => {
      console.error('❌ [Stock Listener] Error in stock decrement listener:', error);
    });

    console.log(`✅ [Stock Listener] Stock decrement listener initialized for fournisseur: ${fournisseurId}`);
    return unsubscribe;
  },

  // Helper methods for notification subtypes
  getOrderNotificationSubType(status: string): string {
    const statusMap: Record<string, string> = {
      'confirmed': 'order_confirmed',
      'preparing': 'order_preparing',
      'out_for_delivery': 'order_shipped',
      'delivered': 'order_delivered',
      'cancelled': 'order_cancelled'
    };
    return statusMap[status] || 'order_status_changed';
  },

  getPaymentNotificationSubType(paymentStatus: string): string {
    const statusMap: Record<string, string> = {
      'paid': 'payment_received',
      'failed': 'payment_failed',
      'pending': 'payment_pending',
      'refunded': 'refund_processed'
    };
    return statusMap[paymentStatus] || 'payment_status_changed';
  }
};

