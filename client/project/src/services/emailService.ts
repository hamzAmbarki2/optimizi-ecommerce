// Client-side email service that posts to the backend email server (Nodemailer)

// Order status email templates
interface OrderEmailTemplate {
  subject: string;
  message: string;
  type: 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'error';
}

// Order status to email template mapping
const ORDER_STATUS_TEMPLATES: Record<string, OrderEmailTemplate> = {
  pending: {
    type: 'warning',
    subject: 'Commande en attente - #{orderNumber}',
    message: `
      Bonjour {userName},
      
      Votre commande #{orderNumber} a été reçue et est actuellement en attente de traitement.
      
      Détails de la commande:
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Adresse de livraison: {deliveryAddress}
      
      Nous vous tiendrons informé(e) de l'évolution de votre commande.
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  confirmed: {
    type: 'info',
    subject: 'Commande confirmée - #{orderNumber}',
    message: `
      Bonjour {userName},
      
      Excellente nouvelle ! Votre commande #{orderNumber} a été confirmée et sera bientôt préparée.
      
      Détails de la commande:
      - Montant total: TND{total}
      - Articles: {itemCount} article(s)
      - Méthode de paiement: {paymentMethod}
      
      Temps de préparation estimé: 15-30 minutes
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  preparing: {
    type: 'secondary',
    subject: 'Préparation en cours - #{orderNumber}',
    message: `
      Bonjour {userName},
      
      Votre commande #{orderNumber} est actuellement en cours de préparation dans nos cuisines.
      
      Nos chefs préparent soigneusement vos {itemCount} article(s) pour vous garantir la meilleure qualité.
      
      Temps de livraison estimé: 20-40 minutes
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  out_for_delivery: {
    type: 'primary',
    subject: 'En cours de livraison - #{orderNumber}',
    message: `
      Bonjour {userName},
      
      Votre commande #{orderNumber} est maintenant en route !
      
      Notre livreur se dirige vers votre adresse:
      {deliveryAddress}
      
      Temps de livraison estimé: 10-20 minutes
      
      Préparez-vous à recevoir votre délicieuse commande !
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  delivered: {
    type: 'success',
    subject: 'Commande livrée - #{orderNumber}',
    message: `
      Bonjour {userName},
      
      Votre commande #{orderNumber} a été livrée avec succès !
      
      Nous espérons que vous apprécierez votre repas. N'hésitez pas à nous laisser un avis sur les produits que vous avez commandés.
      
      Merci de votre confiance et à bientôt sur Optimizi !
      
      Cordialement,
      L'équipe Optimizi
    `
  },
  cancelled: {
    type: 'error',
    subject: 'Commande annulée - #{orderNumber}',
    message: `
      Bonjour {userName},
      
      Nous vous informons que votre commande #{orderNumber} a été annulée.
      
      Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter à support@optimizi.com ou au +1 (555) 123-4567.
      
      Nous nous excusons pour tout désagrément causé.
      
      Cordialement,
      L'équipe Optimizi
    `
  }
};

export class EmailService {
  private static instance: EmailService;
  private backendUrl = import.meta.env.VITE_EMAIL_BACKEND_URL || 'http://localhost:4001';
  private isInitialized = false;
  private isInitializing = false;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize the email service and test backend connection
   */
  public async initialize(): Promise<void> {
    // Prevent concurrent or repeated initialization attempts which can spam the console
    if (this.isInitialized || this.isInitializing) return;
    this.isInitializing = true;

    console.log('🔄 [EmailService] Initializing email service...');
    console.log('🔗 [EmailService] Backend URL:', this.backendUrl);

    try {
      // Test backend connection
      const response = await fetch(`${this.backendUrl}/health`);
      if (response.ok) {
        // We don't need the health payload here, only whether the service is reachable.
        await response.json();
        console.log('✅ [EmailService] Backend connection successful');
        this.isInitialized = true;
      } else {
        console.error('❌ [EmailService] Backend health check failed:', response.status);
        this.isInitialized = false;
      }
    } catch (error) {
      // Keep the error log but avoid printing the stack repeatedly
      console.error('❌ [EmailService] Cannot connect to email backend (check server):', error);
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Check if the email service is ready to send emails
   */
  public async isReady(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isInitialized;
  }

  /**
   * Test the email backend connection
   */
  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      if (response.ok) {
        const health = await response.json();
        return {
          success: true,
          message: 'Backend connection successful',
          details: health
        };
      } else {
        return {
          success: false,
          message: `Backend returned status ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Cannot connect to backend: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Send a test email
   */
  public async sendTestEmail(toEmail: string, subject: string = 'Test Email from Optimizi'): Promise<boolean> {
    this.isInitialized = true;
    
    try {
      const response = await fetch(`${this.backendUrl}/send-test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: toEmail,
          subject,
          message: `
Test email sent at: ${new Date().toISOString()}

This is a test email from the Optimizi client application.

If you received this email, the email integration is working correctly!

Best regards,
Optimizi Team
          `.trim()
        })
      });

      if (response.ok) {
        console.log('✅ [EmailService] Test email sent successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ [EmailService] Test email failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ [EmailService] Test email error:', error);
      return false;
    }
  }

  /**
   * Send order status notification email
   * This will be called automatically when order status changes
   */
  public async sendOrderNotification(orderData: {
    userEmail: string;
    userName: string;
    orderId: string;
    status: string;
    total: number;
    itemCount: number;
    deliveryAddress: string;
    paymentMethod: string;
    userPhone?: string;
    orderNotes?: string;
    items?: Array<{ name: string; quantity: number; unitPrice: number }>;
    orderItemsString?: string;
  }): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.isInitialized) {
        console.error('❌ [EmailService] Email service not initialized');
        return false;
      }
      
      const template = ORDER_STATUS_TEMPLATES[orderData.status];
      if (!template) {
        console.error(`No email template found for status: ${orderData.status}`);
        return false;
      }

      const orderNumber = orderData.orderId.slice(-8).toUpperCase();
      
      console.log('📧 [EmailService] Sending order notification:', {
        to: orderData.userEmail,
        orderNumber,
        status: orderData.status,
        total: orderData.total
      });
      
      // Replace placeholders in the message
      const personalizedMessage = template.message
        .replace(/{userName}/g, orderData.userName)
        .replace(/{orderNumber}/g, orderNumber)
        .replace(/{total}/g, orderData.total.toFixed(2))
        .replace(/{itemCount}/g, orderData.itemCount.toString())
        .replace(/{deliveryAddress}/g, orderData.deliveryAddress)
        .replace(/{paymentMethod}/g, orderData.paymentMethod);

      const personalizedSubject = template.subject
        .replace(/{orderNumber}/g, orderNumber);

      // Build ordered items string for the email template if not provided
      const orderItemsString = orderData.orderItemsString ?? (
        orderData.items && orderData.items.length > 0
          ? orderData.items
              .map(i => `- ${i.quantity} x ${i.name} — TND${i.unitPrice.toFixed(2)}`)
              .join('\n')
          : ''
      );

  // templateParams would be used if integrating with EmailJS templates.
  // For now we post directly to the backend, so we don't use this mapping.

      // POST to backend email server (include order items string)
      const url = `${this.backendUrl}/send-email`;
      console.log('🔗 [EmailService] Posting to backend:', url);

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: orderData.userEmail,
          to_name: orderData.userName,
          subject: personalizedSubject,
          message: personalizedMessage,
          order_items: orderItemsString
        })
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('❌ [EmailService] Backend email send failed:', resp.status, errorText);
        return false;
      }

      console.log('✅ [EmailService] Order notification posted to backend successfully');
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Failed to send order notification:', error);
      return false;
    }
  }

  /**
   * Send contact form email
   * This will be called when user submits the contact form
   */
  public async sendContactFormEmail(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('📧 [EmailService] Sending contact form email:', {
        from: contactData.email,
        subject: contactData.subject
      });
      
      const url = `${this.backendUrl}/send-email`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: 'huwuwhuwu9@gmail.com',
          subject: contactData.subject,
          message: `${contactData.message}\n\nFrom: ${contactData.name} <${contactData.email}>`
        })
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('❌ [EmailService] Contact form email failed:', resp.status, errorText);
        return false;
      }
      
      console.log('✅ [EmailService] Contact form email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Contact form email error:', error);
      return false;
    }
  }

  // Convenience wrapper called by masterOrderService when creating the master order
  public async sendOrderConfirmation(order: any): Promise<boolean> {
    console.log('📧 [EmailService] Sending order confirmation for order:', order.id);
    return this.sendOrderNotification({
      userEmail: order.userEmail,
      userName: order.userName,
      orderId: order.id,
      status: order.status || 'pending',
      total: order.total || 0,
      itemCount: order.items?.length || 0,
      deliveryAddress: order.deliveryAddress ? JSON.stringify(order.deliveryAddress) : '',
      paymentMethod: order.paymentMethod || 'unknown',
      items: order.items
    });
  }

  // Called when the master order status is updated to notify the client
  public async sendOrderStatusUpdate(order: any): Promise<boolean> {
    console.log('📧 [EmailService] Sending order status update for order:', order.id, 'status:', order.status);
    return this.sendOrderNotification({
      userEmail: order.userEmail,
      userName: order.userName,
      orderId: order.id,
      status: order.status,
      total: order.total || 0,
      itemCount: order.items?.length || 0,
      deliveryAddress: order.deliveryAddress ? JSON.stringify(order.deliveryAddress) : '',
      paymentMethod: order.paymentMethod || 'unknown',
      items: order.items
    });
  }

  /**
   * Send promotional email for featured products
   * This is optional and can be implemented later
   */
  public async sendPromotionalEmail(emailData: {
    userEmail: string;
    userName: string;
    featuredProducts: Array<{
      name: string;
      price: number;
      imageUrl: string;
      discount?: number;
    }>;
  }): Promise<boolean> {
  // Reference the param to avoid 'unused' lint errors until implemented
  if (!emailData) return false;
  console.log('Promotional email feature not yet implemented for user:', emailData.userEmail);
  return false;
  }

  /**
   * Check if EmailJS is properly configured
   */
  public isConfigured(): boolean {
  // Return whether the email service is configured and initialized.
  // Avoid logging here because this method may be called frequently
  // (e.g. during renders) and can spam the console.
  return !!this.backendUrl && this.isInitialized;
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();