import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { Order, OrderItem, DeliveryAddress } from '../models';

// Enhanced supplier notification service
export class SupplierNotificationService {
  private static instance: SupplierNotificationService;
  private readonly backendUrl = import.meta.env.VITE_EMAIL_BACKEND_URL || 'http://localhost:4001';

  private constructor() {}

  public static getInstance(): SupplierNotificationService {
    if (!SupplierNotificationService.instance) {
      SupplierNotificationService.instance = new SupplierNotificationService();
    }
    return SupplierNotificationService.instance;
  }

  /**
   * Send comprehensive order notification to supplier
   */
  public async sendOrderNotification(order: Order): Promise<boolean> {
    try {
      console.log(`📧 [SupplierNotification] Sending notification for order: ${order.id}`);

      // Get supplier email and details
      const supplierInfo = await this.getSupplierInfo(order.fournisseurId);
      if (!supplierInfo) {
        console.error(`❌ [SupplierNotification] No supplier info found for: ${order.fournisseurId}`);
        return false;
      }

      // Generate comprehensive email content
      const emailContent = await this.generateEmailContent(order, supplierInfo);
      
      // Send email via backend
      const success = await this.sendEmail(
        supplierInfo.email,
        supplierInfo.name,
        emailContent.subject,
        emailContent.message,
        emailContent.htmlMessage
      );

      if (success) {
        console.log(`✅ [SupplierNotification] Email sent successfully to: ${supplierInfo.email}`);
      } else {
        console.error(`❌ [SupplierNotification] Failed to send email to: ${supplierInfo.email}`);
      }

      return success;
    } catch (error) {
      console.error('❌ [SupplierNotification] Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get supplier information including email and business details
   */
  private async getSupplierInfo(fournisseurId: string): Promise<{
    email: string;
    name: string;
    businessName: string;
    address: string;
    phone?: string;
  } | null> {
    try {
      // Get supplier document
      const supplierDoc = await getDoc(doc(db, 'Fournisseurs', fournisseurId));
      if (!supplierDoc.exists()) {
        console.error(`Supplier document not found: ${fournisseurId}`);
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
        console.error(`User not found for ownerId: ${ownerId}`);
        return null;
      }

      const userData = userSnapshot.docs[0].data();

      return {
        email: userData.email,
        name: userData.fullName || 'Supplier',
        businessName: supplierData.name || 'Business',
        address: supplierData.address || 'Address not provided',
        phone: userData.phone
      };
    } catch (error) {
      console.error('Error fetching supplier info:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive email content
   */
  private async generateEmailContent(order: Order, supplierInfo: any): Promise<{
    subject: string;
    message: string;
    htmlMessage: string;
  }> {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format order items
    const itemsText = this.formatOrderItems(order.items || []);
    const itemsHtml = this.formatOrderItemsHtml(order.items || []);

    // Format addresses
    const deliveryAddressText = this.formatDeliveryAddress(order.deliveryAddress);
    const deliveryAddressHtml = this.formatDeliveryAddressHtml(order.deliveryAddress);

    // Calculate totals
    const subtotal = order.subtotal || 0;
    const deliveryFee = order.deliveryFee || 0;
    const tax = order.tax || 0;
    const total = order.total || 0;

    // Generate subject
    const subject = `🆕 Nouvelle Commande #${orderNumber} - ${order.userName} - TND${total.toFixed(2)}`;

    // Generate plain text message
    const message = `
NOUVELLE COMMANDE REÇUE
========================

Bonjour ${supplierInfo.name},

Vous avez reçu une nouvelle commande sur la plateforme Optimizi !

INFORMATIONS DE LA COMMANDE
---------------------------
• Numéro de commande: #${orderNumber}
• Date et heure: ${orderDate}
• Statut: ${this.getStatusText(order.status)}
• Méthode de paiement: ${this.getPaymentMethodText(order.paymentMethod)}
• Statut du paiement: ${this.getPaymentStatusText(order.paymentStatus)}

INFORMATIONS CLIENT
-------------------
• Nom: ${order.userName}
• Email: ${order.userEmail}
• Téléphone: ${order.userPhone || 'Non fourni'}
• ID Client: ${order.userId}

ADRESSE DE LIVRAISON
--------------------
${deliveryAddressText}

ARTICLES COMMANDÉS
------------------
${itemsText}

RÉCAPITULATIF FINANCIER
-----------------------
• Sous-total: TND${subtotal.toFixed(2)}
• Frais de livraison: TND${deliveryFee.toFixed(2)}
• Taxes: TND${tax.toFixed(2)}
• TOTAL: TND${total.toFixed(2)}

NOTES DE COMMANDE
-----------------
${order.orderNotes || 'Aucune note spéciale'}

ACTIONS REQUISES
----------------
1. Confirmer la réception de cette commande
2. Vérifier la disponibilité des articles
3. Préparer la commande selon les spécifications
4. Mettre à jour le statut dans votre tableau de bord
5. Coordonner la livraison

INFORMATIONS DE CONTACT
-----------------------
Pour toute question concernant cette commande, vous pouvez contacter:
• Client: ${order.userEmail} | ${order.userPhone || 'Téléphone non fourni'}
• Support Optimizi: support@optimizi.com | +216 XX XXX XXX

Merci de traiter cette commande dans les plus brefs délais.

Cordialement,
L'équipe Optimizi

---
Cet email a été envoyé automatiquement. Veuillez ne pas répondre directement à cet email.
Pour toute assistance, contactez notre support client.
    `.trim();

    // Generate HTML message
    const htmlMessage = this.generateHtmlTemplate(order, supplierInfo, {
      orderNumber,
      orderDate,
      itemsHtml,
      deliveryAddressHtml,
      subtotal,
      deliveryFee,
      tax,
      total
    });

    return { subject, message, htmlMessage };
  }

  /**
   * Generate professional HTML email template
   */
  private generateHtmlTemplate(order: Order, supplierInfo: any, data: any): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle Commande - ${data.orderNumber}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            line-height: 1.6;
        }
        .container { 
            max-width: 700px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            padding: 30px; 
            text-align: center; 
            color: white;
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
        }
        .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9;
        }
        .content { 
            padding: 30px; 
        }
        .section { 
            margin-bottom: 30px; 
            padding: 20px; 
            background-color: #f8fafc; 
            border-radius: 12px; 
            border-left: 4px solid #3b82f6;
        }
        .section h2 { 
            margin: 0 0 15px 0; 
            color: #1f2937; 
            font-size: 18px; 
            font-weight: 600;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 15px 0;
        }
        .info-item { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            border: 1px solid #e5e7eb;
        }
        .info-label { 
            font-weight: 600; 
            color: #374151; 
            font-size: 14px; 
            margin-bottom: 5px;
        }
        .info-value { 
            color: #1f2937; 
            font-size: 16px;
        }
        .order-items { 
            background: white; 
            border-radius: 8px; 
            overflow: hidden; 
            border: 1px solid #e5e7eb;
        }
        .item-row { 
            display: flex; 
            align-items: center; 
            padding: 15px; 
            border-bottom: 1px solid #f3f4f6;
        }
        .item-row:last-child { 
            border-bottom: none;
        }
        .item-image { 
            width: 60px; 
            height: 60px; 
            border-radius: 8px; 
            object-fit: cover; 
            margin-right: 15px;
        }
        .item-details { 
            flex: 1;
        }
        .item-name { 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 5px;
        }
        .item-specs { 
            color: #6b7280; 
            font-size: 14px;
        }
        .item-total { 
            font-weight: 600; 
            color: #059669; 
            font-size: 16px;
        }
        .financial-summary { 
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); 
            border: 1px solid #bbf7d0; 
            border-radius: 12px; 
            padding: 20px;
        }
        .financial-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px; 
            padding: 5px 0;
        }
        .financial-row.total { 
            border-top: 2px solid #059669; 
            padding-top: 15px; 
            margin-top: 15px; 
            font-weight: bold; 
            font-size: 18px; 
            color: #059669;
        }
        .status-badge { 
            display: inline-block; 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase;
        }
        .status-pending { 
            background-color: #fef3c7; 
            color: #92400e;
        }
        .status-confirmed { 
            background-color: #dbeafe; 
            color: #1e40af;
        }
        .status-paid { 
            background-color: #d1fae5; 
            color: #065f46;
        }
        .action-buttons { 
            text-align: center; 
            margin: 30px 0;
        }
        .btn { 
            display: inline-block; 
            padding: 15px 30px; 
            margin: 0 10px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px; 
            transition: all 0.3s ease;
        }
        .btn-primary { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            color: white;
        }
        .btn-secondary { 
            background: #f3f4f6; 
            color: #374151; 
            border: 1px solid #d1d5db;
        }
        .footer { 
            background-color: #f8fafc; 
            padding: 25px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
        }
        .urgent-notice { 
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
            border: 1px solid #fca5a5; 
            border-radius: 12px; 
            padding: 20px; 
            margin: 20px 0;
        }
        .urgent-notice h3 { 
            color: #dc2626; 
            margin: 0 0 10px 0; 
            font-size: 16px;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
            .item-row { flex-direction: column; text-align: center; }
            .item-image { margin: 0 0 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🆕 Nouvelle Commande Reçue</h1>
            <p>Commande #${data.orderNumber} • ${data.orderDate}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Urgent Action Required -->
            <div class="urgent-notice">
                <h3>⚡ Action Requise</h3>
                <p style="margin: 0; color: #7f1d1d;">
                    Cette commande nécessite votre attention immédiate. Veuillez confirmer la réception et la disponibilité des articles dans les plus brefs délais.
                </p>
            </div>

            <!-- Order Overview -->
            <div class="section">
                <h2>📋 Aperçu de la Commande</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Numéro de Commande</div>
                        <div class="info-value">#${data.orderNumber}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date de Commande</div>
                        <div class="info-value">${data.orderDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Statut</div>
                        <div class="info-value">
                            <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Paiement</div>
                        <div class="info-value">
                            <span class="status-badge status-${order.paymentStatus}">${this.getPaymentStatusText(order.paymentStatus)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Client Information -->
            <div class="section">
                <h2>👤 Informations Client</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Nom Complet</div>
                        <div class="info-value">${order.userName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">
                            <a href="mailto:${order.userEmail}" style="color: #3b82f6; text-decoration: none;">
                                ${order.userEmail}
                            </a>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">
                            ${order.userPhone ? `<a href="tel:${order.userPhone}" style="color: #3b82f6; text-decoration: none;">${order.userPhone}</a>` : 'Non fourni'}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ID Client</div>
                        <div class="info-value">${order.userId}</div>
                    </div>
                </div>
            </div>

            <!-- Delivery Information -->
            <div class="section">
                <h2>📍 Informations de Livraison</h2>
                ${data.deliveryAddressHtml}
                ${order.deliveryAddress?.instructions ? `
                <div style="margin-top: 15px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div class="info-label" style="color: #92400e;">Instructions Spéciales</div>
                    <div style="color: #78350f; font-style: italic;">${order.deliveryAddress.instructions}</div>
                </div>
                ` : ''}
            </div>

            <!-- Order Items -->
            <div class="section">
                <h2>🛍️ Articles Commandés (${order.items?.length || 0} articles)</h2>
                <div class="order-items">
                    ${data.itemsHtml}
                </div>
            </div>

            <!-- Financial Summary -->
            <div class="section">
                <h2>💰 Récapitulatif Financier</h2>
                <div class="financial-summary">
                    <div class="financial-row">
                        <span>Sous-total:</span>
                        <span>TND${data.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Frais de livraison:</span>
                        <span>TND${data.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Taxes (TVA):</span>
                        <span>TND${data.tax.toFixed(2)}</span>
                    </div>
                    <div class="financial-row total">
                        <span>TOTAL À RECEVOIR:</span>
                        <span>TND${data.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Order Notes -->
            ${order.orderNotes ? `
            <div class="section">
                <h2>📝 Notes de Commande</h2>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; font-style: italic; color: #374151;">
                    "${order.orderNotes}"
                </div>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="${this.getDashboardUrl()}/orders" class="btn btn-primary">
                    📊 Voir dans le Tableau de Bord
                </a>
                <a href="mailto:${order.userEmail}?subject=Concernant votre commande ${data.orderNumber}" class="btn btn-secondary">
                    ✉️ Contacter le Client
                </a>
            </div>

            <!-- Next Steps -->
            <div class="section">
                <h2>🎯 Prochaines Étapes</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <ol style="margin: 0; padding-left: 20px; color: #374151;">
                        <li style="margin-bottom: 8px;"><strong>Confirmer la réception</strong> - Accusez réception de cette commande</li>
                        <li style="margin-bottom: 8px;"><strong>Vérifier les stocks</strong> - Assurez-vous que tous les articles sont disponibles</li>
                        <li style="margin-bottom: 8px;"><strong>Préparer la commande</strong> - Rassemblez et préparez tous les articles</li>
                        <li style="margin-bottom: 8px;"><strong>Mettre à jour le statut</strong> - Utilisez votre tableau de bord pour suivre l'avancement</li>
                        <li style="margin-bottom: 8px;"><strong>Coordonner la livraison</strong> - Organisez la livraison selon l'adresse fournie</li>
                    </ol>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="section">
                <h2>📞 Informations de Contact</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Client</div>
                        <div class="info-value">
                            <a href="mailto:${order.userEmail}" style="color: #3b82f6; text-decoration: none;">
                                ${order.userEmail}
                            </a>
                            ${order.userPhone ? `<br><a href="tel:${order.userPhone}" style="color: #3b82f6; text-decoration: none;">${order.userPhone}</a>` : ''}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Support Optimizi</div>
                        <div class="info-value">
                            <a href="mailto:support@optimizi.com" style="color: #3b82f6; text-decoration: none;">
                                support@optimizi.com
                            </a>
                            <br>
                            <a href="tel:+21612345678" style="color: #3b82f6; text-decoration: none;">
                                +216 12 345 678
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 10px 0; font-weight: 600;">Optimizi - Plateforme E-commerce</p>
            <p style="margin: 0 0 15px 0;">
                Cet email a été envoyé automatiquement suite à une nouvelle commande sur votre boutique.
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                © 2025 Optimizi. Tous droits réservés. | 
                <a href="mailto:support@optimizi.com" style="color: #6b7280;">Support</a> | 
                <a href="#" style="color: #6b7280;">Préférences Email</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Format order items for plain text email
   */
  private formatOrderItems(items: OrderItem[]): string {
    return items.map((item, index) => {
      const itemNumber = (index + 1).toString().padStart(2, '0');
      return `${itemNumber}. ${item.productName}
    • Quantité: ${item.quantity} ${item.unit || 'pièce(s)'}
    • Prix unitaire: TND${item.unitPrice.toFixed(2)}
    • Total: TND${item.totalPrice.toFixed(2)}`;
    }).join('\n\n');
  }

  /**
   * Format order items for HTML email
   */
  private formatOrderItemsHtml(items: OrderItem[]): string {
    return items.map(item => `
      <div class="item-row">
        <img src="${item.productImage || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}" 
             alt="${item.productName}" 
             class="item-image"
             onerror="this.src='https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'">
        <div class="item-details">
          <div class="item-name">${item.productName}</div>
          <div class="item-specs">
            Quantité: ${item.quantity} ${item.unit || 'pièce(s)'} • 
            Prix unitaire: TND${item.unitPrice.toFixed(2)}
          </div>
        </div>
        <div class="item-total">TND${item.totalPrice.toFixed(2)}</div>
      </div>
    `).join('');
  }

  /**
   * Format delivery address for plain text
   */
  private formatDeliveryAddress(address: DeliveryAddress): string {
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
    return `
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 10px;">
          📍 ${address.street}
        </div>
        ${address.address2 ? `<div style="color: #6b7280; margin-bottom: 5px;">${address.address2}</div>` : ''}
        <div style="color: #374151;">
          ${address.city}, ${address.postalCode}
        </div>
        <div style="color: #374151; font-weight: 500;">
          ${address.country}
        </div>
      </div>
    `;
  }

  /**
   * Send email via backend service
   */
  private async sendEmail(
    toEmail: string,
    toName: string,
    subject: string,
    textMessage: string,
    htmlMessage: string
  ): Promise<boolean> {
    try {
      if (!this.backendUrl) {
        console.error('❌ [SupplierNotification] Backend URL not configured');
        return false;
      }

      const response = await fetch(`${this.backendUrl}/send-supplier-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: toEmail,
          to_name: toName,
          subject: subject,
          message: textMessage,
          html_message: htmlMessage
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SupplierNotification] Backend email failed:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ [SupplierNotification] Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ [SupplierNotification] Error sending email:', error);
      return false;
    }
  }

  /**
   * Send test notification email
   */
  public async sendTestNotification(
    supplierEmail: string,
    supplierName: string = 'Test Supplier'
  ): Promise<boolean> {
    try {
      const testOrder: Order = {
        id: `test_${Date.now()}`,
        masterOrderId: `master_test_${Date.now()}`,
        fournisseurId: 'test_supplier',
        fournisseurName: supplierName,
        userId: 'test_user',
        userEmail: 'test.client@example.com',
        userName: 'Jean Dupont',
        userPhone: '+33 1 23 45 67 89',
        subtotal: 45.50,
        deliveryFee: 4.99,
        tax: 5.05,
        total: 55.54,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        deliveryAddress: {
          street: '123 Rue de la Paix',
          address2: 'Appartement 4B',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
          instructions: 'Sonner à la porte, ne pas laisser devant la porte'
        },
        orderNotes: 'Livraison urgente demandée - Client disponible après 18h',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            productId: 'test_product_1',
            productName: 'Pizza Margherita Artisanale',
            productImage: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
            quantity: 2,
            unitPrice: 15.99,
            totalPrice: 31.98,
            unit: 'pièce'
          },
          {
            productId: 'test_product_2',
            productName: 'Salade César Fraîche',
            productImage: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
            quantity: 1,
            unitPrice: 13.52,
            totalPrice: 13.52,
            unit: 'portion'
          }
        ]
      };

      return await this.sendOrderNotification(testOrder);
    } catch (error) {
      console.error('❌ [SupplierNotification] Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    return !!this.backendUrl;
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
        backendUrl: this.backendUrl || 'Not configured'
      }
    };
  }

  // Helper methods for status formatting
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En Attente',
      'confirmed': 'Confirmée',
      'preparing': 'En Préparation',
      'out_for_delivery': 'En Livraison',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  }

  private getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En Attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé'
    };
    return statusMap[status] || status;
  }

  private getPaymentMethodText(method: string): string {
    const methodMap: Record<string, string> = {
      'cash': 'Paiement à la livraison',
      'card': 'Carte bancaire',
      'bank_transfer': 'Virement bancaire',
      'mobile_payment': 'Paiement mobile'
    };
    return methodMap[method] || method;
  }

  private getDashboardUrl(): string {
    return window.location.origin;
  }
}

// Export singleton instance
export const supplierNotificationService = SupplierNotificationService.getInstance();