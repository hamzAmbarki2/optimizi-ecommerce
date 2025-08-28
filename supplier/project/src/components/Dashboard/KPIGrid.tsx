import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config.js';
import { MasterOrder, SubOrder, OrderItem, CartItem, DeliveryAddress } from '../types';
import { emailService } from './emailService';
import { fournisseurService } from './fournisseurService';
import { productService } from './productService';

const MASTER_ORDERS_COLLECTION = 'masterOrders';
const SUB_ORDERS_COLLECTION = 'subOrders';

export interface CreateMasterOrderData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  promoCode?: string; // Optional in input
  orderNotes?: string; // Optional in input
}

export const masterOrderService = {
  // Create a new master order with sub-orders
  async createMasterOrder(orderData: CreateMasterOrderData): Promise<string> {
    try {
      // Group items by fournisseur
      const itemsByFournisseur = new Map<string, CartItem[]>();
      
      for (const item of orderData.items) {
        const fournisseurId = item.product.FournisseurId || 'unknown';
        if (!itemsByFournisseur.has(fournisseurId)) {
          itemsByFournisseur.set(fournisseurId, []);
        }
        itemsByFournisseur.get(fournisseurId)!.push(item);
      }

      // Get fournisseur names
      const fournisseurs = await fournisseurService.getFournisseurs();
      const fournisseurMap = new Map(fournisseurs.map(f => [f.id, f.name]));

      // Create master order first
      const masterOrder: Omit<MasterOrder, 'id'> = {
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        userName: orderData.userName,
        userPhone: orderData.userPhone,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        tax: orderData.tax,
        promoDiscount: orderData.promoDiscount,
        total: orderData.total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod,
        deliveryAddress: orderData.deliveryAddress,
        promoCode: orderData.promoCode || '', // Ensure it's never undefined
        orderNotes: orderData.orderNotes || '', // Ensure it's never undefined
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subOrderIds: [],
        fournisseurCount: itemsByFournisseur.size
      };

      const masterOrderRef = await addDoc(collection(db, MASTER_ORDERS_COLLECTION), masterOrder);
      const masterOrderId = masterOrderRef.id;

      const subOrderIds: string[] = [];

      // Create sub-orders for each fournisseur
      for (const [fournisseurId, fournisseurItems] of itemsByFournisseur) {
        // Convert cart items to order items
        const orderItems: OrderItem[] = fournisseurItems.map(item => {
          const discountedPrice = item.product.discount > 0 
            ? item.product.prixTTC * (1 - item.product.discount / 100)
            : item.product.prixTTC;
          
          return {
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.imageURL,
            quantity: item.quantity,
            unitPrice: discountedPrice,
            totalPrice: discountedPrice * item.quantity,
            discount: item.product.discount > 0 ? item.product.discount : undefined,
          };
        });

        // Calculate totals for this fournisseur's items
        const fournisseurSubtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const fournisseurDeliveryFee = orderData.deliveryFee / itemsByFournisseur.size; // Split delivery fee
        const fournisseurTax = (fournisseurSubtotal * orderData.tax) / orderData.subtotal;
        const fournisseurPromoDiscount = (fournisseurSubtotal * orderData.promoDiscount) / orderData.subtotal;
        const fournisseurTotal = fournisseurSubtotal + fournisseurDeliveryFee + fournisseurTax - fournisseurPromoDiscount;

        const subOrder: Omit<SubOrder, 'id'> = {
          masterOrderId: masterOrderId,
          fournisseurId: fournisseurId,
          fournisseurName: fournisseurMap.get(fournisseurId) || 'Fournisseur inconnu',
          userId: orderData.userId,
          userEmail: orderData.userEmail,
          userName: orderData.userName,
          userPhone: orderData.userPhone,
          items: orderItems,
          subtotal: fournisseurSubtotal,
          deliveryFee: fournisseurDeliveryFee,
          tax: fournisseurTax,
          promoDiscount: fournisseurPromoDiscount,
          total: fournisseurTotal,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: orderData.paymentMethod,
          deliveryAddress: orderData.deliveryAddress,
          orderNotes: orderData.orderNotes || '', // Ensure it's never undefined
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const subOrderRef = await addDoc(collection(db, SUB_ORDERS_COLLECTION), subOrder);
        subOrderIds.push(subOrderRef.id);

        // Create notification for the supplier about the new order
        try {
          await addDoc(collection(db, 'notifications'), {
            type: 'order',
            title: 'Nouvelle commande reçue',
            message: `Nouvelle commande de ${orderData.userName} - Total: €${fournisseurTotal.toFixed(2)}`,
            orderId: subOrderRef.id,
            fournisseurId: fournisseurId,
            isRead: false,
            createdAt: new Date().toISOString(),
            orderData: {
              customerName: orderData.userName,
              customerEmail: orderData.userEmail,
              total: fournisseurTotal,
              itemCount: orderItems.length,
              status: 'pending'
            }
          });
        } catch (notificationError) {
          console.error('Failed to create supplier notification:', notificationError);
          // Don't throw error for notification failure, order creation should succeed
        }

        // Send confirmation email for each sub-order to the fournisseur
        try {
          await emailService.sendOrderConfirmation({
            ...subOrder,
            id: subOrderRef.id
          } as any); // Cast to Order for compatibility
        } catch (emailError) {
          console.error('Failed to send sub-order confirmation email:', emailError);
          // Don't throw error for email failure, order creation should succeed
        }
      }

      // Update master order with sub-order IDs
      await updateDoc(doc(db, MASTER_ORDERS_COLLECTION, masterOrderId), {
        subOrderIds: subOrderIds
      });

      // Send master order confirmation email to client
      try {
        await emailService.sendOrderConfirmation({
          ...masterOrder,
          id: masterOrderId,
          items: orderData.items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.imageURL,
            quantity: item.quantity,
            unitPrice: item.product.prixTTC,
            totalPrice: item.product.prixTTC * item.quantity
          })),
          // Ensure optional fields are not undefined
          promoCode: masterOrder.promoCode || undefined,
          orderNotes: masterOrder.orderNotes || undefined,
          confirmedAt: undefined,
          deliveredAt: undefined
        } as any); // Cast to Order for compatibility
      } catch (emailError) {
        console.error('Failed to send master order confirmation email:', emailError);
      }

      return masterOrderId;
    } catch (error) {
      console.error('Error creating master order:', error);
      throw new Error('Failed to create order');
    }
  },

  // Allow cancellation of master order within a grace period
  async cancelMasterOrder(orderId: string): Promise<void> {
    try {
      const masterOrderRef = doc(db, MASTER_ORDERS_COLLECTION, orderId);
      const masterSnap = await getDoc(masterOrderRef);
      if (!masterSnap.exists()) throw new Error('Order not found');

      const master = masterSnap.data() as MasterOrder;
      if (master.status !== 'pending' && master.status !== 'confirmed') {
        throw new Error('Order cannot be cancelled at this stage');
      }

      await updateDoc(masterOrderRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });

      // Also cancel all sub-orders
      const subOrders = await this.getSubOrdersByMasterOrderId(orderId);
      await Promise.all(
        subOrders.map((sub) => updateDoc(doc(db, SUB_ORDERS_COLLECTION, sub.id), {
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Error cancelling master order:', error);
      throw error;
    }
  },

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

  // Get master orders by user ID
  async getMasterOrdersByUserId(userId: string): Promise<MasterOrder[]> {
    console.log("Fetching master orders for userId:", userId);
    try {
      const ordersRef = collection(db, MASTER_ORDERS_COLLECTION);
      // Remove orderBy from the query to avoid composite index requirement
      const q = query(
        ordersRef, 
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      
      const orders: MasterOrder[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data
        } as MasterOrder);
      });
      
      // Sort orders by createdAt in memory instead of in the query
      orders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log("Fetched master orders:", orders);
      return orders;
    } catch (error) {
      console.error("Error fetching user master orders:", error);
      throw new Error("Failed to fetch orders");
    }
  },


  // Get sub-orders by master order ID
  async getSubOrdersByMasterOrderId(masterOrderId: string): Promise<SubOrder[]> {
    try {
      const subOrdersRef = collection(db, SUB_ORDERS_COLLECTION);
      // Remove orderBy to avoid composite index requirement - we'll sort in memory instead
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
      
      // Sort by createdAt in memory instead of in the query
      subOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // Ascending order (oldest first)
      });
      
      return subOrders;
    } catch (error) {
      console.error('Error fetching sub-orders:', error);
      throw new Error('Failed to fetch sub-orders');
    }
  },

  // Get sub-orders by fournisseur ID (for admin interface)
  async getSubOrdersByFournisseurId(fournisseurId: string): Promise<SubOrder[]> {
    try {
      const subOrdersRef = collection(db, SUB_ORDERS_COLLECTION);
      // Remove orderBy to avoid composite index requirement - we'll sort in memory instead
      const q = query(
        subOrdersRef, 
        where('fournisseurId', '==', fournisseurId)
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
      
      // Sort by createdAt in memory instead of in the query (newest first)
      subOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      return subOrders;
    } catch (error) {
      console.error('Error fetching fournisseur sub-orders:', error);
      throw new Error('Failed to fetch fournisseur orders');
    }
  },

  // Update sub-order status and sync master order
  async updateSubOrderStatus(
    subOrderId: string, 
    status: SubOrder['status'], 
    paymentStatus?: SubOrder['paymentStatus']
  ): Promise<void> {
    try {
      console.log(`🔄 [Client] Updating subOrder ${subOrderId} to status: ${status}, paymentStatus: ${paymentStatus}`);
      
      // Get the sub-order first to check current status and get order items
      const subOrderRef = doc(db, SUB_ORDERS_COLLECTION, subOrderId);
      const subOrderSnap = await getDoc(subOrderRef);
      
      if (!subOrderSnap.exists()) {
        console.error(`❌ [Client] SubOrder ${subOrderId} not found`);
        throw new Error('SubOrder not found');
      }
      
      const currentSubOrder = subOrderSnap.data() as SubOrder;
      const previousStatus = currentSubOrder.status;
      
      console.log(`📊 [Client] SubOrder ${subOrderId} status change: ${previousStatus} → ${status}`);
      
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
        const stockResult = await productService.decrementMultipleProductsStock(stockItems);
        
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
      console.log(`✅ [Client] SubOrder ${subOrderId} updated successfully`);

      // Sync master order status
      console.log(`🔗 [Client] Found masterOrderId: ${currentSubOrder.masterOrderId}, triggering sync...`);
      await this.syncMasterOrderStatus(currentSubOrder.masterOrderId);
    } catch (error) {
      console.error('❌ [Client] Error updating sub-order status:', error);
      throw new Error('Failed to update order status');
    }
  },

  // Sync master order status based on sub-orders
  async syncMasterOrderStatus(masterOrderId: string): Promise<void> {
    try {
      const subOrders = await this.getSubOrdersByMasterOrderId(masterOrderId);
      
      if (subOrders.length === 0) return;

      // Calculate aggregated status
      let masterStatus: MasterOrder['status'] = 'pending';
      let masterPaymentStatus: MasterOrder['paymentStatus'] = 'pending';

      const statuses = subOrders.map(order => order.status);
      const paymentStatuses = subOrders.map(order => order.paymentStatus);

      // Status logic
      if (statuses.every(s => s === 'delivered')) {
        masterStatus = 'delivered';
      } else if (statuses.every(s => s === 'cancelled')) {
        masterStatus = 'cancelled';
      } else if (statuses.some(s => s === 'out_for_delivery')) {
        masterStatus = 'out_for_delivery';
      } else if (statuses.every(s => ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(s))) {
        masterStatus = 'preparing';
      } else if (statuses.every(s => ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(s))) {
        masterStatus = 'confirmed';
      }

      // Payment status logic
      if (paymentStatuses.every(s => s === 'paid')) {
        masterPaymentStatus = 'paid';
      } else if (paymentStatuses.some(s => s === 'failed')) {
        masterPaymentStatus = 'failed';
      } else if (paymentStatuses.some(s => s === 'refunded')) {
        masterPaymentStatus = 'refunded';
      }

      // Update master order
      const masterOrderRef = doc(db, MASTER_ORDERS_COLLECTION, masterOrderId);
      const updateData: any = {
        status: masterStatus,
        paymentStatus: masterPaymentStatus,
        updatedAt: new Date().toISOString()
      };

      if (masterStatus === 'confirmed' && statuses.every(s => ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(s))) {
        updateData.confirmedAt = new Date().toISOString();
      } else if (masterStatus === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }

      await updateDoc(masterOrderRef, updateData);
    } catch (error) {
      console.error('Error syncing master order status:', error);
      throw new Error('Failed to sync master order status');
    }
  }
};