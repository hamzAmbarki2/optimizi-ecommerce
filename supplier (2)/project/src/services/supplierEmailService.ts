import { Order, OrderItem, DeliveryAddress } from '../models';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/config';

// Email configuration interface
interface EmailConfig {
  backendUrl: string;
  supportEmail: string;
}

// Order notification email templates with enhanced content
interface OrderEmailTemplate {
  subject: string;
  message: string;
  htmlTemplate: string;
  type: 'new_order' | 'order_confirmed' | 'order_preparing' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
}

// Comprehensive order status to email template mapping
const ORDER_STATUS_TEMPLATES: Record<string, OrderEmailTemplate> = {
  pending: {
    type: 'new_order',
    subject: '🆕 NOUVELLE COMMANDE REÇUE - #{orderNumber} - TND{total}',
    message: `
NOUVELLE COMMANDE URGENTE
=========================

Bonjour {supplierName},

Vous avez reçu une nouvelle commande qui nécessite votre attention immédiate !

📋 INFORMATIONS DE LA COMMANDE
------------------------------
• Numéro de commande: #{orderNumber}
• Date et heure: {orderDate}
• Statut: EN ATTENTE DE CONFIRMATION
• Montant total: TND{total}
• Nombre d'articles: {itemCount}
• Méthode de paiement: {paymentMethod}
• Statut du paiement: {paymentStatus}

👤 INFORMATIONS CLIENT
----------------------
• Nom complet: {customerName}
• Email: {customerEmail}
• Téléphone: {customerPhone}
• ID Client: {customerId}

📍 ADRESSE DE LIVRAISON
-----------------------
{deliveryAddress}

🛍️ ARTICLES COMMANDÉS
---------------------
{orderItems}

💰 RÉCAPITULATIF FINANCIER
--------------------------
• Sous-total: TND{subtotal}
• Frais de livraison: TND{deliveryFee}
• Taxes (TVA): TND{tax}
• TOTAL: TND{total}

📝 NOTES DE COMMANDE
--------------------
{orderNotes}

⚡ ACTIONS REQUISES
------------------
1. CONFIRMER la réception de cette commande
2. VÉRIFIER la disponibilité de tous les articles
3. PRÉPARER la commande selon les spécifications
4. METTRE À JOUR le statut dans votre tableau de bord
5. COORDONNER la livraison avec le client

📞 CONTACT CLIENT
-----------------
Email: {customerEmail}
Téléphone: {customerPhone}

Merci de traiter cette commande dans les plus brefs délais.

Cordialement,
L'équipe Optimizi
    `,
    htmlTemplate: 'new_order'
  },
  confirmed: {
    type: 'order_confirmed',
    subject: '✅ COMMANDE CONFIRMÉE - #{orderNumber}',
    message: `
COMMANDE CONFIRMÉE
==================

Bonjour {supplierName},

La commande #{orderNumber} a été confirmée et est maintenant en cours de préparation.

📋 DÉTAILS DE LA COMMANDE
-------------------------
• Client: {customerName}
• Email: {customerEmail}
• Téléphone: {customerPhone}
• Montant total: TND{total}
• Articles: {itemCount}
• Adresse de livraison: {deliveryAddress}

🛍️ ARTICLES À PRÉPARER
----------------------
{orderItems}

📝 NOTES DE COMMANDE
--------------------
{orderNotes}

⏱️ TEMPS DE PRÉPARATION ESTIMÉ
------------------------------
15-30 minutes

Cordialement,
L'équipe Optimizi
    `,
    htmlTemplate: 'order_confirmed'
  },
  preparing: {
    type: 'order_preparing',
    subject: '👨‍🍳 PRÉPARATION EN COURS - #{orderNumber}',
    message: `
PRÉPARATION EN COURS
====================

Bonjour {supplierName},

La commande #{orderNumber} est actuellement en cours de préparation.

📋 DÉTAILS DE LA COMMANDE
-------------------------
• Client: {customerName}
• Email: {customerEmail}
• Téléphone: {customerPhone}
• Montant total: TND{total}
• Articles: {itemCount}
• Adresse de livraison: {deliveryAddress}

🛍️ ARTICLES EN PRÉPARATION
--------------------------
{orderItems}

📝 NOTES DE COMMANDE
--------------------
{orderNotes}

⏱️ TEMPS DE LIVRAISON ESTIMÉ
----------------------------
20-40 minutes

Cordialement,
L'équipe Optimizi
    `,
    htmlTemplate: 'order_preparing'
  },
  out_for_delivery: {
    type: 'order_shipped',
    subject: '🚚 EN COURS DE LIVRAISON - #{orderNumber}',
    message: `
COMMANDE EN LIVRAISON
=====================

Bonjour {supplierName},

La commande #{orderNumber} est maintenant en route !

📋 DÉTAILS DE LA COMMANDE
-------------------------
• Client: {customerName}
• Email: {customerEmail}
• Téléphone: {customerPhone}
• Montant total: TND{total}
• Articles: {itemCount}
• Adresse de livraison: {deliveryAddress}

🛍️ ARTICLES LIVRÉS
------------------
{orderItems}

📝 NOTES DE COMMANDE
--------------------
{orderNotes}

⏱️ TEMPS DE LIVRAISON ESTIMÉ
----------------------------
10-20 minutes

Cordialement,
L'équipe Optimizi
    `,
    htmlTemplate: 'order_shipped'
  },
  delivered: {
    type: 'order_delivered',
    subject: '🎉 COMMANDE LIVRÉE - #{orderNumber}',
    message: `
COMMANDE LIVRÉE AVEC SUCCÈS
===========================

Bonjour {supplierName},

La commande #{orderNumber} a été livrée avec succès !

📋 DÉTAILS DE LA COMMANDE
-------------------------
• Client: {customerName}
• Email: {customerEmail}
• Téléphone: {customerPhone}
• Montant total: TND{total}
• Articles: {itemCount}
• Adresse de livraison: {deliveryAddress}

🛍️ ARTICLES LIVRÉS
------------------
{orderItems}

📝 NOTES DE COMMANDE
--------------------
{orderNotes}

🎉 FÉLICITATIONS
----------------
Merci pour votre excellent service !

Cordialement,
L'équipe Optimizi
    `,
    htmlTemplate: 'order_delivered'
  },
  cancelled: {
    type: 'order_cancelled',
    subject: '❌ COMMANDE ANNULÉE - #{orderNumber}',
    message: `
COMMANDE ANNULÉE
================

Bonjour {supplierName},

La commande #{orderNumber} a été annulée.

📋 DÉTAILS DE LA COMMANDE
-------------------------
• Client: {customerName}
• Email: {customerEmail}
• Téléphone: {customerPhone}
• Montant total: TND{total}
• Articles: {itemCount}
• Adresse de livraison: {deliveryAddress}

🛍️ ARTICLES CONCERNÉS
---------------------
{orderItems}

📝 NOTES DE COMMANDE
--------------------
{orderNotes}

ℹ️ INFORMATION
--------------
Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Optimizi
    `,
    htmlTemplate: 'order_cancelled'
  }
};

export class SupplierEmailService {
  private static instance: SupplierEmailService;
  private isInitialized = false;
  private readonly backendUrl = import.meta.env.VITE_EMAIL_BACKEND_URL || 'http://localhost:4001';
  private readonly supportEmail = import.meta.env.VITE_SUPPLIER_SUPPORT_EMAIL || 'support@optimizi.com';

  private constructor() {}

  public static getInstance(): SupplierEmailService {
    if (!SupplierEmailService.instance) {
      SupplierEmailService.instance = new SupplierEmailService();
    }
    return SupplierEmailService.instance;
  }

  /**
   * Initialize the email service
   */
  public initialize(): void {
    console.log('🔄 [SupplierEmailService] Initializing supplier email service...');
    console.log('🔗 [SupplierEmailService] Backend URL:', this.backendUrl);
    console.log('📧 [SupplierEmailService] Support Email:', this.supportEmail);
    this.isInitialized = true;
  }

  /**
   * Test backend connection
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
   * Send comprehensive order notification email to supplier
   */
  public async sendOrderNotification(order: Order): Promise<boolean> {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      console.log(`📧 [SupplierEmailService] Processing order notification for: ${order.id}`);

      const template = ORDER_STATUS_TEMPLATES[order.status];
      if (!template) {
        console.error(`❌ [SupplierEmailService] No email template found for status: ${order.status}`);
        return false;
      }

      const orderNumber = order.id?.slice(-8).toUpperCase() || `ORD-${Date.now()}`;

      // Get supplier email and information
      const supplierInfo = await this.getSupplierInfo(order.fournisseurId);
      if (!supplierInfo) {
        console.error(`❌ [SupplierEmailService] No supplier info found for: ${order.fournisseurId}`);
        return false;
      }

      console.log(`📧 [SupplierEmailService] Sending to supplier: ${supplierInfo.email}`);

      // Generate email content
      const emailContent = this.generateEmailContent(order, supplierInfo, template, orderNumber);

      // Send email via backend
      const success = await this.sendEmailViaBackend(
        supplierInfo.email,
        supplierInfo.name,
        emailContent.subject,
        emailContent.textMessage,
        emailContent.htmlMessage,
        order
      );

      if (success) {
        console.log(`✅ [SupplierEmailService] Email sent successfully to: ${supplierInfo.email}`);
        
        // Log successful notification
        await this.logNotification(order.id, supplierInfo.email, 'success');
      } else {
        console.error(`❌ [SupplierEmailService] Failed to send email to: ${supplierInfo.email}`);
        
        // Log failed notification
        await this.logNotification(order.id, supplierInfo.email, 'failed');
      }

      return success;
    } catch (error) {
      console.error('❌ [SupplierEmailService] Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get comprehensive supplier information
   */
  private async getSupplierInfo(fournisseurId: string): Promise<{
    email: string;
    name: string;
    businessName: string;
    address: string;
    phone?: string;
    taxNumber?: string;
    openingHours?: string;
  } | null> {
    try {
      // Get supplier document
      const supplierDoc = await getDoc(doc(db, 'Fournisseurs', fournisseurId));
      if (!supplierDoc.exists()) {
        console.error(`❌ [SupplierEmailService] Supplier document not found: ${fournisseurId}`);
        return null;
      }

      const supplierData = supplierDoc.data();
      const ownerId = supplierData.ownerId;

      // Get owner's user data for email
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', ownerId)
      );
      
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        console.error(`❌ [SupplierEmailService] User not found for ownerId: ${ownerId}`);
        return null;
      }

      const userData = userSnapshot.docs[0].data();

      return {
        email: userData.email,
        name: userData.fullName || 'Supplier',
        businessName: supplierData.name || 'Business',
        address: supplierData.address || 'Address not provided',
        phone: userData.phone,
        taxNumber: supplierData.matriculeFiscale,
        openingHours: supplierData.openingHours
      };
    } catch (error) {
      console.error('❌ [SupplierEmailService] Error fetching supplier info:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive email content
   */
  private generateEmailContent(
    order: Order, 
    supplierInfo: any, 
    template: OrderEmailTemplate, 
    orderNumber: string
  ): {
    subject: string;
    textMessage: string;
    htmlMessage: string;
  } {
    const orderDate = new Date(order.createdAt).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Format order items
    const orderItemsText = this.formatOrderItemsText(order.items || []);
    const orderItemsHtml = this.formatOrderItemsHtml(order.items || []);

    // Format delivery address
    const deliveryAddressText = this.formatDeliveryAddressText(order.deliveryAddress);
    const deliveryAddressHtml = this.formatDeliveryAddressHtml(order.deliveryAddress);

    // Replace placeholders in templates
    const replacements = {
      '{supplierName}': supplierInfo.name,
      '{businessName}': supplierInfo.businessName,
      '{orderNumber}': orderNumber,
      '{orderDate}': orderDate,
      '{customerName}': order.userName,
      '{customerEmail}': order.userEmail,
      '{customerPhone}': order.userPhone || 'Non fourni',
      '{customerId}': order.userId,
      '{total}': (order.total || 0).toFixed(2),
      '{subtotal}': (order.subtotal || 0).toFixed(2),
      '{deliveryFee}': (order.deliveryFee || 0).toFixed(2),
      '{tax}': (order.tax || 0).toFixed(2),
      '{itemCount}': String(order.items?.length || 0),
      '{deliveryAddress}': deliveryAddressText,
      '{orderItems}': orderItemsText,
      '{orderNotes}': order.orderNotes || 'Aucune note spéciale',
      '{paymentMethod}': this.getPaymentMethodText(order.paymentMethod),
      '{paymentStatus}': this.getPaymentStatusText(order.paymentStatus),
      '{orderStatus}': this.getStatusText(order.status)
    };

    // Apply replacements
    let subject = template.subject;
    let textMessage = template.message;

    Object.entries(replacements).forEach(([placeholder, value]) => {
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      textMessage = textMessage.replace(new RegExp(placeholder, 'g'), value);
    });

    // Generate HTML message
    const htmlMessage = this.generateHtmlTemplate(order, supplierInfo, {
      orderNumber,
      orderDate,
      orderItemsHtml,
      deliveryAddressHtml,
      template: template.htmlTemplate
    });

    return { subject, textMessage, htmlMessage };
  }

  /**
   * Generate professional HTML email template
   */
  private generateHtmlTemplate(order: Order, supplierInfo: any, data: any): string {
    const statusColor = this.getStatusColor(order.status);
    const priorityLevel = this.getPriorityLevel(order.status);
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Commande - ${data.orderNumber}</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            line-height: 1.6;
            color: #374151;
        }
        .container { 
            max-width: 700px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-radius: 16px;
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, ${statusColor.primary} 0%, ${statusColor.secondary} 100%); 
            padding: 40px 30px; 
            text-align: center; 
            color: white;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .header-content { position: relative; z-index: 1; }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 32px; 
            font-weight: bold; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header p { 
            margin: 0; 
            font-size: 18px; 
            opacity: 0.95;
            font-weight: 500;
        }
        .priority-badge {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .content { 
            padding: 40px 30px; 
        }
        .section { 
            margin-bottom: 35px; 
            padding: 25px; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
            border-radius: 16px; 
            border-left: 5px solid ${statusColor.primary};
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .section h2 { 
            margin: 0 0 20px 0; 
            color: #1f2937; 
            font-size: 20px; 
            font-weight: 700;
            display: flex;
            align-items: center;
        }
        .section-icon {
            margin-right: 10px;
            font-size: 24px;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 20px 0;
        }
        .info-item { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .info-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .info-label { 
            font-weight: 600; 
            color: #6b7280; 
            font-size: 14px; 
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value { 
            color: #1f2937; 
            font-size: 16px;
            font-weight: 500;
        }
        .order-items { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .item-row { 
            display: flex; 
            align-items: center; 
            padding: 20px; 
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.2s ease;
        }
        .item-row:hover {
            background-color: #f9fafb;
        }
        .item-row:last-child { 
            border-bottom: none;
        }
        .item-image { 
            width: 80px; 
            height: 80px; 
            border-radius: 12px; 
            object-fit: cover; 
            margin-right: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .item-details { 
            flex: 1;
        }
        .item-name { 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 8px;
            font-size: 18px;
        }
        .item-specs { 
            color: #6b7280; 
            font-size: 14px;
            margin-bottom: 5px;
        }
        .item-total { 
            font-weight: 700; 
            color: #059669; 
            font-size: 20px;
            text-align: right;
        }
        .financial-summary { 
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); 
            border: 2px solid #bbf7d0; 
            border-radius: 16px; 
            padding: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .financial-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            padding: 8px 0;
            font-size: 16px;
        }
        .financial-row.total { 
            border-top: 3px solid #059669; 
            padding-top: 20px; 
            margin-top: 20px; 
            font-weight: 800; 
            font-size: 24px; 
            color: #059669;
        }
        .status-badge { 
            display: inline-flex;
            align-items: center;
            padding: 8px 16px; 
            border-radius: 25px; 
            font-size: 14px; 
            font-weight: 700; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pending { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            color: #92400e;
            border: 1px solid #f59e0b;
        }
        .status-confirmed { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
            color: #1e40af;
            border: 1px solid #3b82f6;
        }
        .status-paid { 
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); 
            color: #065f46;
            border: 1px solid #10b981;
        }
        .action-buttons { 
            text-align: center; 
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 16px;
        }
        .btn { 
            display: inline-block; 
            padding: 16px 32px; 
            margin: 0 12px 12px 0; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 700; 
            font-size: 16px; 
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .btn-primary { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            color: white;
        }
        .btn-secondary { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
            color: #374151; 
            border: 1px solid #d1d5db;
        }
        .btn-success { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white;
        }
        .footer { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
            padding: 30px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
        }
        .urgent-notice { 
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
            border: 2px solid #fca5a5; 
            border-radius: 16px; 
            padding: 25px; 
            margin: 25px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .urgent-notice h3 { 
            color: #dc2626; 
            margin: 0 0 15px 0; 
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
        }
        .contact-info {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .next-steps {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .next-steps ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        .next-steps li {
            margin-bottom: 10px;
            font-weight: 500;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 12px; }
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .info-grid { grid-template-columns: 1fr; }
            .item-row { flex-direction: column; text-align: center; padding: 15px; }
            .item-image { margin: 0 0 15px 0; }
            .btn { display: block; margin: 10px 0; }
            .financial-row { font-size: 14px; }
            .financial-row.total { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1>🆕 Nouvelle Commande Reçue</h1>
                <p>Commande #${data.orderNumber} • ${data.orderDate}</p>
                <div class="priority-badge">
                    ${priorityLevel} PRIORITÉ
                </div>
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Urgent Action Required -->
            <div class="urgent-notice">
                <h3>
                    <span style="margin-right: 10px;">⚡</span>
                    ACTION REQUISE IMMÉDIATEMENT
                </h3>
                <p style="margin: 0; color: #7f1d1d; font-weight: 500; font-size: 16px;">
                    Cette commande nécessite votre attention immédiate. Veuillez confirmer la réception et vérifier la disponibilité des articles dans les plus brefs délais pour garantir la satisfaction du client.
                </p>
            </div>

            <!-- Order Overview -->
            <div class="section">
                <h2>
                    <span class="section-icon">📋</span>
                    Aperçu de la Commande
                </h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Numéro de Commande</div>
                        <div class="info-value" style="font-family: monospace; font-size: 18px; font-weight: 700; color: #3b82f6;">
                            #${data.orderNumber}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date et Heure</div>
                        <div class="info-value">${data.orderDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Statut de la Commande</div>
                        <div class="info-value">
                            <span class="status-badge status-${order.status}">
                                ${this.getStatusIcon(order.status)} ${this.getStatusText(order.status)}
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Statut du Paiement</div>
                        <div class="info-value">
                            <span class="status-badge status-${order.paymentStatus}">
                                ${this.getPaymentIcon(order.paymentStatus)} ${this.getPaymentStatusText(order.paymentStatus)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Client Information -->
            <div class="section">
                <h2>
                    <span class="section-icon">👤</span>
                    Informations Client
                </h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Nom Complet</div>
                        <div class="info-value" style="font-size: 18px; font-weight: 600;">${order.userName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Adresse Email</div>
                        <div class="info-value">
                            <a href="mailto:${order.userEmail}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">
                                ${order.userEmail}
                            </a>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Numéro de Téléphone</div>
                        <div class="info-value">
                            ${order.userPhone ? `
                                <a href="tel:${order.userPhone}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">
                                    ${order.userPhone}
                                </a>
                            ` : '<span style="color: #9ca3af; font-style: italic;">Non fourni</span>'}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ID Client</div>
                        <div class="info-value" style="font-family: monospace; color: #6b7280;">
                            ${order.userId}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delivery Information -->
            <div class="section">
                <h2>
                    <span class="section-icon">📍</span>
                    Informations de Livraison
                </h2>
                ${data.deliveryAddressHtml}
                ${order.deliveryAddress?.instructions ? `
                <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <div class="info-label" style="color: #92400e; margin-bottom: 10px;">
                        📝 Instructions Spéciales de Livraison
                    </div>
                    <div style="color: #78350f; font-style: italic; font-size: 16px; font-weight: 500;">
                        "${order.deliveryAddress.instructions}"
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Order Items -->
            <div class="section">
                <h2>
                    <span class="section-icon">🛍️</span>
                    Articles Commandés (${order.items?.length || 0} articles)
                </h2>
                <div class="order-items">
                    ${data.orderItemsHtml}
                </div>
            </div>

            <!-- Financial Summary -->
            <div class="section">
                <h2>
                    <span class="section-icon">💰</span>
                    Récapitulatif Financier
                </h2>
                <div class="financial-summary">
                    <div class="financial-row">
                        <span>Sous-total des articles:</span>
                        <span style="font-weight: 600;">TND${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Frais de livraison:</span>
                        <span style="font-weight: 600;">TND${(order.deliveryFee || 0).toFixed(2)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Taxes (TVA incluse):</span>
                        <span style="font-weight: 600;">TND${(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div class="financial-row total">
                        <span>MONTANT TOTAL À RECEVOIR:</span>
                        <span>TND${(order.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Order Notes -->
            ${order.orderNotes ? `
            <div class="section">
                <h2>
                    <span class="section-icon">📝</span>
                    Notes de Commande
                </h2>
                <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; font-style: italic; color: #374151; font-size: 16px; line-height: 1.6; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    "${order.orderNotes}"
                </div>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="action-buttons">
                <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px;">Actions Rapides</h3>
                <a href="${this.getDashboardUrl()}/orders" class="btn btn-primary">
                    📊 Ouvrir le Tableau de Bord
                </a>
                <a href="mailto:${order.userEmail}?subject=Concernant votre commande ${data.orderNumber}&body=Bonjour ${order.userName},%0D%0A%0D%0ANous avons bien reçu votre commande ${data.orderNumber}.%0D%0A%0D%0ACordialement,%0D%0A${supplierInfo.businessName}" class="btn btn-secondary">
                    ✉️ Contacter le Client
                </a>
                <a href="tel:${order.userPhone || ''}" class="btn btn-success">
                    📞 Appeler le Client
                </a>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
                <h3 style="margin: 0 0 20px 0; color: #065f46; font-size: 20px; font-weight: 700;">
                    🎯 Prochaines Étapes Obligatoires
                </h3>
                <ol style="margin: 0; padding-left: 25px; color: #374151;">
                    <li style="margin-bottom: 12px; font-weight: 600;">
                        <strong style="color: #dc2626;">CONFIRMER</strong> la réception de cette commande dans les 15 minutes
                    </li>
                    <li style="margin-bottom: 12px; font-weight: 600;">
                        <strong style="color: #d97706;">VÉRIFIER</strong> la disponibilité de tous les articles commandés
                    </li>
                    <li style="margin-bottom: 12px; font-weight: 600;">
                        <strong style="color: #7c3aed;">PRÉPARER</strong> la commande selon les spécifications exactes
                    </li>
                    <li style="margin-bottom: 12px; font-weight: 600;">
                        <strong style="color: #0891b2;">METTRE À JOUR</strong> le statut en temps réel dans votre tableau de bord
                    </li>
                    <li style="margin-bottom: 12px; font-weight: 600;">
                        <strong style="color: #059669;">COORDONNER</strong> la livraison selon l'adresse et les instructions fournies
                    </li>
                </ol>
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
                <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 18px; font-weight: 700;">
                    📞 Informations de Contact
                </h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Contact Client Direct</div>
                        <div class="info-value">
                            <a href="mailto:${order.userEmail}" style="color: #3b82f6; text-decoration: none; font-weight: 600; display: block; margin-bottom: 5px;">
                                📧 ${order.userEmail}
                            </a>
                            ${order.userPhone ? `
                                <a href="tel:${order.userPhone}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">
                                    📱 ${order.userPhone}
                                </a>
                            ` : '<span style="color: #9ca3af;">📱 Téléphone non fourni</span>'}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Support Optimizi</div>
                        <div class="info-value">
                            <a href="mailto:${this.supportEmail}" style="color: #3b82f6; text-decoration: none; font-weight: 600; display: block; margin-bottom: 5px;">
                                📧 ${this.supportEmail}
                            </a>
                            <a href="tel:+21612345678" style="color: #3b82f6; text-decoration: none; font-weight: 600;">
                                📞 +216 12 345 678
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div style="margin-bottom: 20px;">
                <img src="https://via.placeholder.com/120x40/3b82f6/ffffff?text=OPTIMIZI" alt="Optimizi Logo" style="height: 40px;">
            </div>
            <p style="margin: 0 0 15px 0; font-weight: 600; font-size: 16px; color: #374151;">
                Optimizi - Plateforme E-commerce Professionnelle
            </p>
            <p style="margin: 0 0 20px 0; line-height: 1.6;">
                Cet email a été envoyé automatiquement suite à une nouvelle commande sur votre boutique.<br>
                Pour toute assistance technique, contactez notre équipe support.
            </p>
            <div style="border-top: 1px solid #d1d5db; padding-top: 20px; font-size: 12px; opacity: 0.8;">
                <p style="margin: 0;">
                    © 2025 Optimizi. Tous droits réservés. | 
                    <a href="mailto:${this.supportEmail}" style="color: #6b7280; text-decoration: none;">Support Technique</a> | 
                    <a href="${this.getDashboardUrl()}/profile" style="color: #6b7280; text-decoration: none;">Préférences Email</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Format order items for plain text email
   */
  private formatOrderItemsText(items: OrderItem[]): string {
    if (!items || items.length === 0) {
      return 'Aucun article dans cette commande.';
    }

    return items.map((item, index) => {
      const itemNumber = (index + 1).toString().padStart(2, '0');
      return `${itemNumber}. ${item.productName}
    • Quantité: ${item.quantity} ${item.unit || 'pièce(s)'}
    • Prix unitaire: TND${item.unitPrice.toFixed(2)}
    • Total article: TND${item.totalPrice.toFixed(2)}`;
    }).join('\n\n');
  }

  /**
   * Format order items for HTML email
   */
  private formatOrderItemsHtml(items: OrderItem[]): string {
    if (!items || items.length === 0) {
      return `
        <div class="item-row" style="text-align: center; color: #9ca3af; font-style: italic;">
          Aucun article dans cette commande.
        </div>
      `;
    }

    return items.map((item, index) => `
      <div class="item-row">
        <img src="${item.productImage || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}" 
             alt="${item.productName}" 
             class="item-image"
             onerror="this.src='https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'">
        <div class="item-details">
          <div class="item-name">${index + 1}. ${item.productName}</div>
          <div class="item-specs">
            <strong>Quantité:</strong> ${item.quantity} ${item.unit || 'pièce(s)'}<br>
            <strong>Prix unitaire:</strong> TND${item.unitPrice.toFixed(2)}<br>
            <strong>ID Produit:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${item.productId}</code>
          </div>
        </div>
        <div class="item-total">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Total</div>
          TND${item.totalPrice.toFixed(2)}
        </div>
      </div>
    `).join('');
  }

  /**
   * Format delivery address for plain text
   */
  private formatDeliveryAddressText(address: DeliveryAddress): string {
    if (!address) {
      return 'Adresse de livraison non spécifiée';
    }

    let formatted = `${address.street}`;
    if (address.address2) {
      formatted += `\n${address.address2}`;
    }
    formatted += `\n${address.city}, ${address.postalCode}`;
    formatted += `\n${address.country}`;
    
    if (address.instructions) {
      formatted += `\n\nInstructions spéciales: ${address.instructions}`;
    }
    
    return formatted;
  }

  /**
   * Format delivery address for HTML
   */
  private formatDeliveryAddressHtml(address: DeliveryAddress): string {
    if (!address) {
      return `
        <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-style: italic;">
          Adresse de livraison non spécifiée
        </div>
      `;
    }

    return `
      <div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="font-weight: 700; color: #1f2937; margin-bottom: 15px; font-size: 18px; display: flex; align-items: center;">
          <span style="margin-right: 10px;">🏠</span>
          ${address.street}
        </div>
        ${address.address2 ? `
          <div style="color: #6b7280; margin-bottom: 10px; font-size: 16px; padding-left: 30px;">
            ${address.address2}
          </div>
        ` : ''}
        <div style="color: #374151; font-size: 16px; font-weight: 600; padding-left: 30px;">
          📍 ${address.city}, ${address.postalCode}
        </div>
        <div style="color: #374151; font-weight: 600; font-size: 16px; padding-left: 30px; margin-top: 5px;">
          🌍 ${address.country}
        </div>
      </div>
    `;
  }

  /**
   * Send email via backend service with enhanced error handling
   */
  private async sendEmailViaBackend(
    toEmail: string,
    toName: string,
    subject: string,
    textMessage: string,
    htmlMessage: string,
    order: Order
  ): Promise<boolean> {
    try {
      if (!this.backendUrl) {
        console.error('❌ [SupplierEmailService] Backend URL not configured');
        return false;
      }

      console.log(`📧 [SupplierEmailService] Sending email to: ${toEmail}`);
      console.log(`📧 [SupplierEmailService] Subject: ${subject}`);

      const payload = {
        to_email: toEmail,
        to_name: toName,
        subject: subject,
        message: textMessage,
        html_message: htmlMessage,
        order_metadata: {
          id: order.id,
          masterOrderId: (order as any).masterOrderId,
          total: order.total,
          itemCount: order.items?.length || 0,
          status: order.status,
          paymentStatus: order.paymentStatus,
          customerName: order.userName,
          customerEmail: order.userEmail
        }
      };

      const response = await fetch(`${this.backendUrl}/send-supplier-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SupplierEmailService] Backend email failed:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ [SupplierEmailService] Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ [SupplierEmailService] Error sending email:', error);
      return false;
    }
  }

  /**
   * Send test notification email with comprehensive test data
   */
  public async sendTestNotification(
    supplierEmail: string,
    supplierName: string = 'Test Supplier'
  ): Promise<boolean> {
    try {
      console.log(`🧪 [SupplierEmailService] Sending test notification to: ${supplierEmail}`);

      const testOrder: Order = {
        id: `test_order_${Date.now()}`,
        masterOrderId: `master_test_${Date.now()}`,
        fournisseurId: 'test_supplier_id',
        fournisseurName: supplierName,
        userId: 'test_user_12345',
        userEmail: 'jean.dupont@example.com',
        userName: 'Jean Dupont',
        userPhone: '+33 1 23 45 67 89',
        subtotal: 89.50,
        deliveryFee: 7.99,
        tax: 9.75,
        total: 107.24,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        deliveryAddress: {
          street: '123 Avenue des Champs-Élysées',
          address2: 'Appartement 4B, 2ème étage',
          city: 'Paris',
          postalCode: '75008',
          country: 'France',
          instructions: 'Sonner à la porte principale. Ne pas laisser devant la porte. Client disponible après 18h en semaine.'
        },
        orderNotes: 'Commande urgente pour un événement spécial. Livraison souhaitée avant 19h. Client allergique aux noix - vérifier tous les ingrédients SVP.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            productId: 'prod_pizza_margherita_001',
            productName: 'Pizza Margherita Artisanale (Pâte Fine)',
            productImage: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
            quantity: 2,
            unitPrice: 18.99,
            totalPrice: 37.98,
            unit: 'pièce'
          },
          {
            productId: 'prod_salade_cesar_002',
            productName: 'Salade César Fraîche avec Poulet Grillé',
            productImage: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
            quantity: 1,
            unitPrice: 15.99,
            totalPrice: 15.99,
            unit: 'portion'
          },
          {
            productId: 'prod_tiramisu_003',
            productName: 'Tiramisu Maison aux Amaretti',
            productImage: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
            quantity: 3,
            unitPrice: 11.84,
            totalPrice: 35.52,
            unit: 'portion'
          }
        ]
      };

      const success = await this.sendOrderNotification(testOrder);
      
      if (success) {
        console.log(`✅ [SupplierEmailService] Test notification sent successfully to: ${supplierEmail}`);
      } else {
        console.error(`❌ [SupplierEmailService] Test notification failed for: ${supplierEmail}`);
      }

      return success;
    } catch (error) {
      console.error('❌ [SupplierEmailService] Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Send bulk order notifications for multiple orders
   */
  public async sendBulkOrderNotifications(orders: Order[]): Promise<{
    successful: number;
    failed: number;
    results: boolean[];
  }> {
    console.log(`📧 [SupplierEmailService] Sending bulk notifications for ${orders.length} orders`);

    const results = await Promise.allSettled(
      orders.map(order => this.sendOrderNotification(order))
    );
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;
    
    const failed = results.length - successful;
    
    const booleanResults = results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );

    console.log(`📊 [SupplierEmailService] Bulk notification results: ${successful} successful, ${failed} failed`);

    return { successful, failed, results: booleanResults };
  }

  /**
   * Log notification attempt for tracking and debugging
   */
  private async logNotification(orderId: string, supplierEmail: string, status: 'success' | 'failed'): Promise<void> {
    try {
      // In a production system, you might want to log this to a separate collection
      console.log(`📝 [SupplierEmailService] Logging notification: Order ${orderId}, Email ${supplierEmail}, Status ${status}`);
      
      // Could implement actual logging to Firebase here
      // await addDoc(collection(db, 'emailLogs'), {
      //   orderId,
      //   supplierEmail,
      //   status,
      //   timestamp: new Date().toISOString(),
      //   type: 'supplier_notification'
      // });
    } catch (error) {
      console.error('❌ [SupplierEmailService] Error logging notification:', error);
    }
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    const configured = !!this.backendUrl;
    console.log('🔍 [SupplierEmailService] Configuration check:', {
      hasBackendUrl: !!this.backendUrl,
      backendUrl: this.backendUrl,
      supportEmail: this.supportEmail,
      configured
    });
    return configured;
  }

  /**
   * Get configuration status for debugging
   */
  public getConfigStatus(): {
    isConfigured: boolean;
    missingFields: string[];
    currentValues: any;
  } {
    const missingFields: string[] = [];
    if (!this.backendUrl) missingFields.push('VITE_EMAIL_BACKEND_URL');

    return {
      isConfigured: missingFields.length === 0,
      missingFields,
      currentValues: {
        backendUrl: this.backendUrl || 'Not configured',
        supportEmail: this.supportEmail
      }
    };
  }

  // Helper methods for status and formatting
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

  private getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En Attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  private getPaymentMethodText(method: string): string {
    const methodMap: Record<string, string> = {
      'cash': 'Paiement à la livraison (Espèces)',
      'card': 'Carte bancaire',
      'bank_transfer': 'Virement bancaire',
      'mobile_payment': 'Paiement mobile',
      'paypal': 'PayPal',
      'stripe': 'Stripe'
    };
    return methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1);
  }

  private getStatusColor(status: string): { primary: string; secondary: string } {
    const colorMap: Record<string, { primary: string; secondary: string }> = {
      'pending': { primary: '#f59e0b', secondary: '#d97706' },
      'confirmed': { primary: '#3b82f6', secondary: '#2563eb' },
      'preparing': { primary: '#8b5cf6', secondary: '#7c3aed' },
      'out_for_delivery': { primary: '#06b6d4', secondary: '#0891b2' },
      'delivered': { primary: '#10b981', secondary: '#059669' },
      'cancelled': { primary: '#ef4444', secondary: '#dc2626' }
    };
    return colorMap[status] || { primary: '#6b7280', secondary: '#4b5563' };
  }

  private getPriorityLevel(status: string): string {
    const priorityMap: Record<string, string> = {
      'pending': 'HAUTE',
      'confirmed': 'MOYENNE',
      'preparing': 'MOYENNE',
      'out_for_delivery': 'NORMALE',
      'delivered': 'BASSE',
      'cancelled': 'HAUTE'
    };
    return priorityMap[status] || 'NORMALE';
  }

  private getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'out_for_delivery': '🚚',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return iconMap[status] || '📋';
  }

  private getPaymentIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'pending': '⏳',
      'paid': '💰',
      'failed': '❌',
      'refunded': '💸'
    };
    return iconMap[status] || '💳';
  }

  private getDashboardUrl(): string {
    return window.location.origin;
  }
}

// Export singleton instance
export const supplierEmailService = SupplierEmailService.getInstance();