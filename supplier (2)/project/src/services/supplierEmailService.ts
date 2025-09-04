import { Order, OrderItem, DeliveryAddress } from '../models';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/config';

// Email configuration interface
interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

// Order notification email templates
interface OrderEmailTemplate {
  subject: string;
  message: string;
  type: 'new_order' | 'order_confirmed' | 'order_preparing' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
}

// Order status to email template mapping
const ORDER_STATUS_TEMPLATES: Record<string, OrderEmailTemplate> = {
  pending: {
    type: 'new_order',
    subject: '🆕 Nouvelle Commande Reçue - #{orderNumber}',
    message: `
      Bonjour {supplierName},
      
      Vous avez reçu une nouvelle commande !
      
      Détails de la commande:
      - Numéro de commande: #{orderNumber}
      - Client: {customerName}
      - Email: {customerEmail}
      - Téléphone: {customerPhone}
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Articles commandés:
      {orderItems}
      
      Notes de commande: {orderNotes}
      
      Veuillez confirmer cette commande dès que possible.
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  confirmed: {
    type: 'order_confirmed',
    subject: '✅ Commande Confirmée - #{orderNumber}',
    message: `
      Bonjour {supplierName},
      
      La commande #{orderNumber} a été confirmée et est maintenant en cours de préparation.
      
      Détails de la commande:
      - Client: {customerName}
      - Email: {customerEmail}
      - Téléphone: {customerPhone}
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Articles à préparer:
      {orderItems}
      
      Notes de commande: {orderNotes}
      
      Temps de préparation estimé: 15-30 minutes
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  preparing: {
    type: 'order_preparing',
    subject: '👨‍🍳 Préparation en Cours - #{orderNumber}',
    message: `
      Bonjour {supplierName},
      
      La commande #{orderNumber} est actuellement en cours de préparation.
      
      Détails de la commande:
      - Client: {customerName}
      - Email: {customerEmail}
      - Téléphone: {customerPhone}
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Articles en préparation:
      {orderItems}
      
      Notes de commande: {orderNotes}
      
      Temps de livraison estimé: 20-40 minutes
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  out_for_delivery: {
    type: 'order_shipped',
    subject: '🚚 En Cours de Livraison - #{orderNumber}',
    message: `
      Bonjour {supplierName},
      
      La commande #{orderNumber} est maintenant en route !
      
      Détails de la commande:
      - Client: {customerName}
      - Email: {customerEmail}
      - Téléphone: {customerPhone}
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Articles livrés:
      {orderItems}
      
      Notes de commande: {orderNotes}
      
      Temps de livraison estimé: 10-20 minutes
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  delivered: {
    type: 'order_delivered',
    subject: '🎉 Commande Livrée - #{orderNumber}',
    message: `
      Bonjour {supplierName},
      
      La commande #{orderNumber} a été livrée avec succès !
      
      Détails de la commande:
      - Client: {customerName}
      - Email: {customerEmail}
      - Téléphone: {customerPhone}
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Articles livrés:
      {orderItems}
      
      Notes de commande: {orderNotes}
      
      Merci pour votre excellent service !
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  cancelled: {
    type: 'order_cancelled',
    subject: '❌ Commande Annulée - #{orderNumber}',
    message: `
      Bonjour {supplierName},
      
      La commande #{orderNumber} a été annulée.
      
      Détails de la commande:
      - Client: {customerName}
      - Email: {customerEmail}
      - Téléphone: {customerPhone}
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Articles concernés:
      {orderItems}
      
      Notes de commande: {orderNotes}
      
      Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter.
      
      Cordialement,
      L'équipe Optimizi
    `
  }
};

export class SupplierEmailService {
  private static instance: SupplierEmailService;
  private isInitialized = false;
  // Backend email service URL (the Express + Nodemailer server)
  private readonly backendUrl = import.meta.env.VITE_EMAIL_BACKEND_URL || '';

  private constructor() {}

  public static getInstance(): SupplierEmailService {
    if (!SupplierEmailService.instance) {
      SupplierEmailService.instance = new SupplierEmailService();
    }
    return SupplierEmailService.instance;
  }

  /**
   * Initialize EmailJS
   * This should be called once when the app starts
   */
  public initialize(): void {
  // No client-side initialization required for backend-based email sending.
  this.isInitialized = true;
  }

  /**
   * Send order notification email to supplier
   * This will be called automatically when order status changes
   */
  public async sendOrderNotification(order: Order): Promise<boolean> {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      const template = ORDER_STATUS_TEMPLATES[order.status];
      if (!template) {
        console.error(`No email template found for status: ${order.status}`);
        return false;
      }

      const orderNumber = order.id?.slice(-8).toUpperCase() || `ORD-${Date.now()}`;

      // Get supplier email from database (client-side lookup)
      const supplierEmail = await this.getSupplierEmail(order.fournisseurId);
      if (!supplierEmail) {
        console.error(`No email found for supplier: ${order.fournisseurId}`);
        return false;
      }

      // Format order items and address
      const orderItemsText = this.formatOrderItems(order.items || []);
  const deliveryAddressFormatted = this.formatDeliveryAddress(order.deliveryAddress || ({} as DeliveryAddress));

      const personalizedMessage = template.message
        .replace(/{supplierName}/g, order.fournisseurName || 'Fournisseur')
        .replace(/{orderNumber}/g, orderNumber)
        .replace(/{customerName}/g, order.userName)
        .replace(/{customerEmail}/g, order.userEmail)
        .replace(/{customerPhone}/g, order.userPhone || 'Non fourni')
        .replace(/{total}/g, (order.total || 0).toFixed ? (order.total as any).toFixed(2) : String(order.total || 0))
        .replace(/{itemCount}/g, String(order.items?.length || 0))
        .replace(/{deliveryAddress}/g, deliveryAddressFormatted)
        .replace(/{orderItems}/g, orderItemsText)
        .replace(/{orderNotes}/g, order.orderNotes || 'Aucune note');

      const personalizedSubject = template.subject.replace(/{orderNumber}/g, orderNumber);

      // POST to backend email service
      const url = `${this.backendUrl}/send-supplier-email`;
      console.log('Posting email payload to backend:', url);

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: supplierEmail,
          to_name: order.fournisseurName || 'Fournisseur',
          subject: personalizedSubject,
          message: personalizedMessage,
          order: {
            id: order.id,
            masterOrderId: (order as any).masterOrderId,
            items: order.items,
            total: order.total
          }
        })
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Backend email send failed:', resp.status, text);
        return false;
      }

      console.log('Supplier order notification posted to backend successfully');
      return true;
    } catch (error) {
      console.error('Failed to send supplier order notification email via backend:', error);
      return false;
    }
  }

  /**
   * Format order items for email display
   */
  private formatOrderItems(items: OrderItem[]): string {
    return items.map(item => 
      `• ${item.productName} - Quantité: ${item.quantity} ${item.unit || 'pièce(s)'} - Prix: TND${item.totalPrice.toFixed(2)}`
    ).join('\n');
  }

  /**
   * Format delivery address for email display
   */
  private formatDeliveryAddress(address: DeliveryAddress): string {
    let formatted = `${address.street}, ${address.city} ${address.postalCode}, ${address.country}`;
    if (address.instructions) {
      formatted += `\nInstructions: ${address.instructions}`;
    }
    return formatted;
  }

  /**
   * Get supplier email address from database
   */
  private async getSupplierEmail(supplierId: string): Promise<string | null> {
    try {
      // First, get the supplier document to find the owner ID
      const supplierQuery = query(
        collection(db, 'Fournisseurs'),
        where('id', '==', supplierId)
      );
      
      let supplierSnapshot = await getDocs(supplierQuery);
      
      // If not found by id field, try by document ID
      if (supplierSnapshot.empty) {
        const supplierDoc = await getDocs(query(collection(db, 'Fournisseurs')));
        const supplierData = supplierDoc.docs.find(doc => doc.id === supplierId);
        if (supplierData) {
          const data = supplierData.data();
          const ownerId = data.ownerId;
          
          // Get the user email from the users collection
          const userQuery = query(
            collection(db, 'users'),
            where('uid', '==', ownerId)
          );
          
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            return userData.email || null;
          }
        }
      } else {
        const supplierData = supplierSnapshot.docs[0].data();
        const ownerId = supplierData.ownerId;
        
        // Get the user email from the users collection
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', ownerId)
        );
        
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          return userData.email || null;
        }
      }
      
      console.error(`No email found for supplier: ${supplierId}`);
      return null;
    } catch (error) {
      console.error('Error fetching supplier email:', error);
      return null;
    }
  }

  /**
   * Send bulk order notifications (for multiple orders)
   */
  public async sendBulkOrderNotifications(orders: Order[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      orders.map(order => this.sendOrderNotification(order))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  /**
   * Check if EmailJS is properly configured
   */
  public isConfigured(): boolean {
    const configured = !!this.backendUrl;
    console.log('🔍 [SupplierEmailService] Configuration check:', {
      hasBackendUrl: !!this.backendUrl,
      backendUrl: this.backendUrl,
      configured
    });
    return configured;
  }

  /**
   * Get configuration status for debugging
   */
  public getConfigStatus(): { isConfigured: boolean; missingFields: string[]; currentValues: any } {
    const missingFields: string[] = [];
    if (!this.backendUrl) missingFields.push('VITE_EMAIL_BACKEND_URL');

    return {
      isConfigured: missingFields.length === 0,
      missingFields,
      currentValues: {
        backendUrl: this.backendUrl || 'http://localhost:4001 (default)'
      }
    };
  }

  /**
   * Test email sending with a mock order
   */
  public async sendTestEmail(supplierEmail: string, supplierName: string = 'Test Supplier'): Promise<boolean> {
    this.initialize();
    
    console.log('🧪 [SupplierEmailService] Sending test email to:', supplierEmail);

    try {
      const template = ORDER_STATUS_TEMPLATES.pending;
      const testOrderNumber = 'TEST' + Date.now().toString().slice(-6);
      const personalizedMessage = template.message
        .replace(/{supplierName}/g, supplierName)
        .replace(/{orderNumber}/g, testOrderNumber)
        .replace(/{customerName}/g, 'Test Customer')
        .replace(/{customerEmail}/g, 'test@example.com')
        .replace(/{customerPhone}/g, '+33 1 23 45 67 89')
        .replace(/{total}/g, '25.99')
        .replace(/{itemCount}/g, '2')
        .replace(/{deliveryAddress}/g, '123 Rue de Test, 75001 Paris, France')
        .replace(/{orderItems}/g, '• Produit Test 1 - Quantité: 1 pièce(s) - Prix: TND15.99\n• Produit Test 2 - Quantité: 1 pièce(s) - Prix: TND9.99')
        .replace(/{orderNotes}/g, 'Ceci est un email de test');

      const personalizedSubject = template.subject.replace(/{orderNumber}/g, testOrderNumber);

      const url = `${this.backendUrl}/send-test-email`;
      console.log('🔗 [SupplierEmailService] Posting test email to:', url);

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: supplierEmail,
          to_name: supplierName,
          subject: personalizedSubject,
          message: personalizedMessage
        })
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('❌ [SupplierEmailService] Test email failed:', resp.status, errorText);
        return false;
      }

      console.log('✅ [SupplierEmailService] Test email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [SupplierEmailService] Test email error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supplierEmailService = SupplierEmailService.getInstance();