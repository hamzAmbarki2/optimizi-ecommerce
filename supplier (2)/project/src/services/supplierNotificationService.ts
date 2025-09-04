import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { Order, OrderItem, DeliveryAddress } from '../models';

/**
 * Enhanced supplier notification service with comprehensive email templates and error handling
 */
export class SupplierNotificationService {
  private static instance: SupplierNotificationService;
  private readonly backendUrl = import.meta.env.VITE_EMAIL_BACKEND_URL || 'http://localhost:4001';
  private readonly supportEmail = import.meta.env.VITE_SUPPLIER_SUPPORT_EMAIL || 'support@optimizi.com';
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SupplierNotificationService {
    if (!SupplierNotificationService.instance) {
      SupplierNotificationService.instance = new SupplierNotificationService();
    }
    return SupplierNotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  public initialize(): void {
    console.log('🔄 [SupplierNotificationService] Initializing comprehensive notification service...');
    console.log('🔗 [SupplierNotificationService] Backend URL:', this.backendUrl);
    console.log('📧 [SupplierNotificationService] Support Email:', this.supportEmail);
    
    this.isInitialized = true;
    
    // Test backend connection on initialization
    this.testBackendConnection();
  }

  /**
   * Test backend connection
   */
  private async testBackendConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const health = await response.json();
        console.log('✅ [SupplierNotificationService] Backend connection successful:', health);
      } else {
        console.error('❌ [SupplierNotificationService] Backend health check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Cannot connect to email backend:', error);
      console.log('💡 [SupplierNotificationService] Make sure the email server is running on:', this.backendUrl);
    }
  }

  /**
   * Send comprehensive order notification to supplier
   */
  public async sendOrderNotification(order: Order): Promise<boolean> {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      console.log(`📧 [SupplierNotificationService] Processing order notification for: ${order.id}`);

      // Get comprehensive supplier information
      const supplierInfo = await this.getSupplierInfo(order.fournisseurId);
      if (!supplierInfo) {
        console.error(`❌ [SupplierNotificationService] No supplier info found for: ${order.fournisseurId}`);
        return false;
      }

      console.log(`📧 [SupplierNotificationService] Sending to supplier: ${supplierInfo.email} (${supplierInfo.businessName})`);

      // Generate comprehensive email content
      const emailContent = this.generateComprehensiveEmailContent(order, supplierInfo);
      
      // Send email via backend with enhanced payload
      const success = await this.sendEmailViaBackend(
        supplierInfo.email,
        supplierInfo.name,
        emailContent.subject,
        emailContent.textMessage,
        emailContent.htmlMessage,
        order,
        supplierInfo
      );

      if (success) {
        console.log(`✅ [SupplierNotificationService] Email sent successfully to: ${supplierInfo.email}`);
        
        // Create in-app notification
        await this.createInAppNotification(order, supplierInfo);
        
        // Log successful notification
        await this.logNotificationEvent(order, supplierInfo, 'success');
      } else {
        console.error(`❌ [SupplierNotificationService] Failed to send email to: ${supplierInfo.email}`);
        
        // Log failed notification
        await this.logNotificationEvent(order, supplierInfo, 'failed');
      }

      return success;
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Error sending notification:', error);
      await this.logNotificationEvent(order, null, 'error');
      return false;
    }
  }

  /**
   * Get comprehensive supplier information including business details
   */
  private async getSupplierInfo(fournisseurId: string): Promise<{
    email: string;
    name: string;
    businessName: string;
    address: string;
    phone?: string;
    taxNumber?: string;
    openingHours?: string;
    ownerId: string;
  } | null> {
    try {
      // Get supplier document
      const supplierDoc = await getDoc(doc(db, 'Fournisseurs', fournisseurId));
      if (!supplierDoc.exists()) {
        console.error(`❌ [SupplierNotificationService] Supplier document not found: ${fournisseurId}`);
        return null;
      }

      const supplierData = supplierDoc.data();
      const ownerId = supplierData.ownerId;

      // Get owner's user data for email and personal info
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', ownerId)
      );
      
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        console.error(`❌ [SupplierNotificationService] User not found for ownerId: ${ownerId}`);
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
        openingHours: supplierData.openingHours,
        ownerId: ownerId
      };
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Error fetching supplier info:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive email content with professional formatting
   */
  private generateComprehensiveEmailContent(order: Order, supplierInfo: any): {
    subject: string;
    textMessage: string;
    htmlMessage: string;
  } {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Generate subject based on order status and priority
    const subject = this.generateEmailSubject(order, orderNumber);

    // Generate comprehensive text message
    const textMessage = this.generateTextMessage(order, supplierInfo, orderNumber, orderDate);

    // Generate professional HTML message
    const htmlMessage = this.generateHtmlMessage(order, supplierInfo, orderNumber, orderDate);

    return { subject, textMessage, htmlMessage };
  }

  /**
   * Generate email subject with priority and context
   */
  private generateEmailSubject(order: Order, orderNumber: string): string {
    const priorityPrefix = this.getPriorityPrefix(order.status);
    const statusEmoji = this.getStatusEmoji(order.status);
    const total = (order.total || 0).toFixed(2);
    
    const subjectTemplates: Record<string, string> = {
      'pending': `${priorityPrefix}${statusEmoji} NOUVELLE COMMANDE #${orderNumber} - ${order.userName} - TND${total}`,
      'confirmed': `${statusEmoji} COMMANDE CONFIRMÉE #${orderNumber} - Préparation requise`,
      'preparing': `${statusEmoji} EN PRÉPARATION #${orderNumber} - ${order.userName}`,
      'out_for_delivery': `${statusEmoji} EN LIVRAISON #${orderNumber} - Suivi requis`,
      'delivered': `${statusEmoji} LIVRÉE #${orderNumber} - Succès confirmé`,
      'cancelled': `${priorityPrefix}${statusEmoji} ANNULÉE #${orderNumber} - Action requise`
    };

    return subjectTemplates[order.status] || `${statusEmoji} COMMANDE #${orderNumber} - ${order.status.toUpperCase()}`;
  }

  /**
   * Generate comprehensive text message
   */
  private generateTextMessage(order: Order, supplierInfo: any, orderNumber: string, orderDate: string): string {
    const statusText = this.getStatusText(order.status);
    const paymentStatusText = this.getPaymentStatusText(order.paymentStatus);
    const paymentMethodText = this.getPaymentMethodText(order.paymentMethod);
    
    const orderItemsText = this.formatOrderItemsText(order.items || []);
    const deliveryAddressText = this.formatDeliveryAddressText(order.deliveryAddress);
    
    const urgencyLevel = this.getUrgencyLevel(order.status);
    const actionRequired = this.getRequiredActions(order.status);

    return `
${urgencyLevel} - NOTIFICATION COMMANDE OPTIMIZI
${'='.repeat(50)}

Bonjour ${supplierInfo.name},

${this.getStatusMessage(order.status, order.userName, orderNumber)}

📋 INFORMATIONS DÉTAILLÉES DE LA COMMANDE
${'─'.repeat(45)}
• Numéro de commande: #${orderNumber}
• Date et heure: ${orderDate}
• Statut actuel: ${statusText}
• Méthode de paiement: ${paymentMethodText}
• Statut du paiement: ${paymentStatusText}
• ID Commande système: ${order.id}
• ID Commande maître: ${(order as any).masterOrderId || 'N/A'}

👤 INFORMATIONS CLIENT COMPLÈTES
${'─'.repeat(35)}
• Nom complet: ${order.userName}
• Adresse email: ${order.userEmail}
• Numéro de téléphone: ${order.userPhone || 'Non fourni'}
• ID Client: ${order.userId}
• Historique client: ${this.getCustomerHistory(order.userId)}

📍 ADRESSE DE LIVRAISON DÉTAILLÉE
${'─'.repeat(37)}
${deliveryAddressText}

🛍️ ARTICLES COMMANDÉS (${order.items?.length || 0} articles)
${'─'.repeat(30)}
${orderItemsText}

💰 RÉCAPITULATIF FINANCIER COMPLET
${'─'.repeat(35)}
• Sous-total des articles: TND${(order.subtotal || 0).toFixed(2)}
• Frais de livraison: TND${(order.deliveryFee || 0).toFixed(2)}
• Taxes (TVA incluse): TND${(order.tax || 0).toFixed(2)}
• Remise appliquée: TND${((order as any).promoDiscount || 0).toFixed(2)}
• MONTANT TOTAL: TND${(order.total || 0).toFixed(2)}

📝 NOTES ET INSTRUCTIONS
${'─'.repeat(25)}
${order.orderNotes || 'Aucune note spéciale pour cette commande.'}

${order.deliveryAddress?.instructions ? `
🚚 INSTRUCTIONS DE LIVRAISON SPÉCIALES
${'─'.repeat(38)}
${order.deliveryAddress.instructions}
` : ''}

⚡ ACTIONS REQUISES IMMÉDIATEMENT
${'─'.repeat(33)}
${actionRequired}

📞 INFORMATIONS DE CONTACT
${'─'.repeat(26)}
• Contact client direct:
  - Email: ${order.userEmail}
  - Téléphone: ${order.userPhone || 'Non fourni'}

• Support Optimizi:
  - Email: ${this.supportEmail}
  - Téléphone: +216 12 345 678
  - Assistance technique 24/7

🏢 INFORMATIONS FOURNISSEUR
${'─'.repeat(28)}
• Entreprise: ${supplierInfo.businessName}
• Responsable: ${supplierInfo.name}
• Adresse: ${supplierInfo.address}
• Numéro fiscal: ${supplierInfo.taxNumber || 'Non renseigné'}
• Horaires: ${supplierInfo.openingHours || 'Non renseignés'}

⏰ DÉLAIS ET ATTENTES
${'─'.repeat(21)}
• Confirmation attendue: Dans les 15 minutes
• Préparation estimée: 15-30 minutes
• Livraison estimée: 30-60 minutes
• Mise à jour requise: En temps réel

🎯 OBJECTIFS DE QUALITÉ
${'─'.repeat(23)}
• Taux de confirmation: > 95%
• Temps de préparation: < 30 min
• Satisfaction client: > 4.5/5
• Livraison à temps: > 90%

Merci de traiter cette commande avec le plus grand soin.

Cordialement,
L'équipe Optimizi

${'─'.repeat(50)}
Cet email a été envoyé automatiquement.
Pour toute assistance: ${this.supportEmail}
Tableau de bord: ${this.getDashboardUrl()}
${'─'.repeat(50)}
    `.trim();
  }

  /**
   * Generate professional HTML message with enhanced styling
   */
  private generateHtmlMessage(order: Order, supplierInfo: any, orderNumber: string, orderDate: string): string {
    const statusColor = this.getStatusColor(order.status);
    const urgencyLevel = this.getUrgencyLevel(order.status);
    const orderItemsHtml = this.formatOrderItemsHtml(order.items || []);
    const deliveryAddressHtml = this.formatDeliveryAddressHtml(order.deliveryAddress);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Commande Optimizi - ${orderNumber}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8fafc;
        }
        .email-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-radius: 20px;
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, ${statusColor.primary} 0%, ${statusColor.secondary} 100%); 
            padding: 50px 40px; 
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
            background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        .header-content { position: relative; z-index: 1; }
        .header h1 { 
            font-size: 36px; 
            font-weight: 800; 
            margin-bottom: 15px;
            text-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header p { 
            font-size: 20px; 
            opacity: 0.95;
            font-weight: 500;
            margin-bottom: 20px;
        }
        .urgency-badge {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 30px;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            backdrop-filter: blur(10px);
        }
        .content { 
            padding: 50px 40px; 
        }
        .section { 
            margin-bottom: 40px; 
            padding: 30px; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
            border-radius: 20px; 
            border-left: 6px solid ${statusColor.primary};
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        .section::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, ${statusColor.primary}20 0%, transparent 70%);
            border-radius: 0 20px 0 100px;
        }
        .section h2 { 
            color: #1f2937; 
            font-size: 24px; 
            font-weight: 700;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
        }
        .section-icon {
            margin-right: 15px;
            font-size: 28px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 25px; 
            margin: 25px 0;
        }
        .info-card { 
            background: white; 
            padding: 25px; 
            border-radius: 16px; 
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .info-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: ${statusColor.primary};
        }
        .info-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .info-label { 
            font-weight: 600; 
            color: #6b7280; 
            font-size: 14px; 
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value { 
            color: #1f2937; 
            font-size: 18px;
            font-weight: 600;
            line-height: 1.4;
        }
        .order-items-container { 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .item-row { 
            display: flex; 
            align-items: center; 
            padding: 25px; 
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.3s ease;
        }
        .item-row:hover {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }
        .item-row:last-child { 
            border-bottom: none;
        }
        .item-image { 
            width: 100px; 
            height: 100px; 
            border-radius: 16px; 
            object-fit: cover; 
            margin-right: 25px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            border: 3px solid white;
        }
        .item-details { 
            flex: 1;
        }
        .item-name { 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 10px;
            font-size: 20px;
            line-height: 1.3;
        }
        .item-specs { 
            color: #6b7280; 
            font-size: 15px;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        .item-id {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            color: #6b7280;
        }
        .item-total { 
            font-weight: 800; 
            color: #059669; 
            font-size: 24px;
            text-align: right;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .financial-summary { 
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); 
            border: 3px solid #bbf7d0; 
            border-radius: 20px; 
            padding: 30px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        .financial-summary::before {
            content: '💰';
            position: absolute;
            top: -15px;
            right: 20px;
            font-size: 30px;
            background: white;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .financial-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 15px; 
            padding: 12px 0;
            font-size: 18px;
            font-weight: 500;
        }
        .financial-row.total { 
            border-top: 3px solid #059669; 
            padding-top: 25px; 
            margin-top: 25px; 
            font-weight: 800; 
            font-size: 28px; 
            color: #059669;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-badge { 
            display: inline-flex;
            align-items: center;
            padding: 10px 20px; 
            border-radius: 30px; 
            font-size: 14px; 
            font-weight: 700; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .action-section { 
            text-align: center; 
            margin: 50px 0;
            padding: 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 20px;
            border: 2px solid #e5e7eb;
        }
        .action-section h3 {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 25px;
        }
        .btn { 
            display: inline-block; 
            padding: 18px 36px; 
            margin: 8px 12px; 
            text-decoration: none; 
            border-radius: 16px; 
            font-weight: 700; 
            font-size: 16px; 
            transition: all 0.3s ease;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .btn-primary { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            color: white;
        }
        .btn-secondary { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
            color: #374151; 
            border: 2px solid #d1d5db;
        }
        .btn-success { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white;
        }
        .btn-warning { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white;
        }
        .urgent-alert { 
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
            border: 3px solid #fca5a5; 
            border-radius: 20px; 
            padding: 30px; 
            margin: 30px 0;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        .urgent-alert::before {
            content: '⚡';
            position: absolute;
            top: -20px;
            left: 30px;
            font-size: 40px;
            background: white;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .urgent-alert h3 { 
            color: #dc2626; 
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .next-steps {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px solid #bbf7d0;
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
        }
        .next-steps::before {
            content: '🎯';
            position: absolute;
            top: -20px;
            right: 30px;
            font-size: 40px;
            background: white;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .next-steps h3 {
            color: #065f46;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .next-steps ol {
            margin: 20px 0;
            padding-left: 30px;
        }
        .next-steps li {
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 16px;
            line-height: 1.5;
        }
        .contact-section {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #93c5fd;
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
        }
        .footer { 
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%); 
            padding: 40px; 
            text-align: center; 
            color: #d1d5db;
        }
        .footer-logo {
            font-size: 24px;
            font-weight: 800;
            color: white;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        @media (max-width: 600px) {
            .email-container { margin: 10px; border-radius: 16px; }
            .content, .header { padding: 30px 25px; }
            .info-grid { grid-template-columns: 1fr; }
            .item-row { flex-direction: column; text-align: center; padding: 20px; }
            .item-image { margin: 0 0 20px 0; }
            .btn { display: block; margin: 15px 0; }
            .financial-row { font-size: 16px; }
            .financial-row.total { font-size: 24px; }
            .header h1 { font-size: 28px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1>${this.getStatusEmoji(order.status)} ${this.getHeaderTitle(order.status)}</h1>
                <p>Commande #${orderNumber} • ${orderDate}</p>
                <div class="urgency-badge">
                    ${urgencyLevel}
                </div>
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Urgent Action Alert -->
            ${this.shouldShowUrgentAlert(order.status) ? `
            <div class="urgent-alert">
                <h3>ACTION IMMÉDIATE REQUISE</h3>
                <p style="color: #7f1d1d; font-weight: 600; font-size: 18px; line-height: 1.5;">
                    Cette commande nécessite votre attention immédiate. Veuillez confirmer la réception et vérifier la disponibilité des articles dans les <strong>15 prochaines minutes</strong> pour garantir la satisfaction du client et respecter nos standards de qualité.
                </p>
            </div>
            ` : ''}

            <!-- Order Overview -->
            <div class="section">
                <h2>
                    <span class="section-icon">📋</span>
                    Aperçu Détaillé de la Commande
                </h2>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Numéro de Commande</div>
                        <div class="info-value" style="font-family: 'SF Mono', Monaco, monospace; font-size: 20px; color: #3b82f6;">
                            #${orderNumber}
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Date et Heure de Commande</div>
                        <div class="info-value">${orderDate}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Statut de la Commande</div>
                        <div class="info-value">
                            <span class="status-badge" style="background: ${statusColor.primary}20; color: ${statusColor.primary}; border: 2px solid ${statusColor.primary}40;">
                                ${this.getStatusIcon(order.status)} ${this.getStatusText(order.status)}
                            </span>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Méthode de Paiement</div>
                        <div class="info-value">${this.getPaymentMethodText(order.paymentMethod)}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Statut du Paiement</div>
                        <div class="info-value">
                            <span class="status-badge" style="background: ${this.getPaymentStatusColor(order.paymentStatus)}20; color: ${this.getPaymentStatusColor(order.paymentStatus)}; border: 2px solid ${this.getPaymentStatusColor(order.paymentStatus)}40;">
                                ${this.getPaymentIcon(order.paymentStatus)} ${this.getPaymentStatusText(order.paymentStatus)}
                            </span>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">ID Système</div>
                        <div class="info-value" style="font-family: 'SF Mono', Monaco, monospace; font-size: 14px; color: #6b7280;">
                            ${order.id}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Client Information -->
            <div class="section">
                <h2>
                    <span class="section-icon">👤</span>
                    Informations Client Complètes
                </h2>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Nom Complet du Client</div>
                        <div class="info-value" style="font-size: 22px; color: #1f2937;">${order.userName}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Adresse Email</div>
                        <div class="info-value">
                            <a href="mailto:${order.userEmail}?subject=Concernant votre commande ${orderNumber}" 
                               style="color: #3b82f6; text-decoration: none; font-weight: 700; font-size: 16px;">
                                📧 ${order.userEmail}
                            </a>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Numéro de Téléphone</div>
                        <div class="info-value">
                            ${order.userPhone ? `
                                <a href="tel:${order.userPhone}" 
                                   style="color: #3b82f6; text-decoration: none; font-weight: 700; font-size: 16px;">
                                    📱 ${order.userPhone}
                                </a>
                            ` : '<span style="color: #9ca3af; font-style: italic;">📱 Non fourni</span>'}
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Identifiant Client</div>
                        <div class="info-value" style="font-family: 'SF Mono', Monaco, monospace; color: #6b7280; font-size: 14px;">
                            ${order.userId}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delivery Information -->
            <div class="section">
                <h2>
                    <span class="section-icon">📍</span>
                    Informations de Livraison Détaillées
                </h2>
                ${deliveryAddressHtml}
                ${order.deliveryAddress?.instructions ? `
                <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; border-left: 6px solid #f59e0b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div class="info-label" style="color: #92400e; margin-bottom: 15px; font-size: 16px;">
                        📝 Instructions Spéciales de Livraison
                    </div>
                    <div style="color: #78350f; font-style: italic; font-size: 18px; font-weight: 600; line-height: 1.5; background: white; padding: 15px; border-radius: 10px;">
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
                <div class="order-items-container">
                    ${orderItemsHtml}
                </div>
            </div>

            <!-- Financial Summary -->
            <div class="section">
                <h2>
                    <span class="section-icon">💰</span>
                    Récapitulatif Financier Détaillé
                </h2>
                <div class="financial-summary">
                    <div class="financial-row">
                        <span>Sous-total des articles:</span>
                        <span style="font-weight: 700;">TND${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Frais de livraison:</span>
                        <span style="font-weight: 700;">TND${(order.deliveryFee || 0).toFixed(2)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Taxes (TVA incluse):</span>
                        <span style="font-weight: 700;">TND${(order.tax || 0).toFixed(2)}</span>
                    </div>
                    ${((order as any).promoDiscount || 0) > 0 ? `
                    <div class="financial-row" style="color: #dc2626;">
                        <span>Remise appliquée:</span>
                        <span style="font-weight: 700;">-TND${((order as any).promoDiscount || 0).toFixed(2)}</span>
                    </div>
                    ` : ''}
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
                    Notes de Commande du Client
                </h2>
                <div style="background: white; padding: 25px; border-radius: 16px; border: 2px solid #e5e7eb; font-style: italic; color: #374151; font-size: 18px; line-height: 1.6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="font-size: 24px; margin-bottom: 15px;">💬</div>
                    "${order.orderNotes}"
                </div>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="action-section">
                <h3>🚀 Actions Rapides Disponibles</h3>
                <div style="margin: 25px 0;">
                    <a href="${this.getDashboardUrl()}/orders" class="btn btn-primary">
                        📊 Ouvrir le Tableau de Bord
                    </a>
                    <a href="mailto:${order.userEmail}?subject=Concernant votre commande ${orderNumber}&body=Bonjour ${order.userName},%0D%0A%0D%0ANous avons bien reçu votre commande ${orderNumber} et nous la traitons actuellement.%0D%0A%0D%0ACordialement,%0D%0A${supplierInfo.businessName}" class="btn btn-secondary">
                        ✉️ Contacter le Client
                    </a>
                    ${order.userPhone ? `
                        <a href="tel:${order.userPhone}" class="btn btn-success">
                            📞 Appeler le Client
                        </a>
                    ` : ''}
                    <a href="${this.getDashboardUrl()}/orders?action=confirm&orderId=${order.id}" class="btn btn-warning">
                        ✅ Confirmer la Commande
                    </a>
                </div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
                <h3>🎯 Plan d'Action Détaillé</h3>
                <ol style="color: #374151;">
                    <li>
                        <strong style="color: #dc2626;">CONFIRMER IMMÉDIATEMENT</strong> la réception de cette commande (délai: 15 minutes maximum)
                    </li>
                    <li>
                        <strong style="color: #d97706;">VÉRIFIER MINUTIEUSEMENT</strong> la disponibilité et la qualité de tous les articles commandés
                    </li>
                    <li>
                        <strong style="color: #7c3aed;">PRÉPARER SOIGNEUSEMENT</strong> la commande selon les spécifications exactes du client
                    </li>
                    <li>
                        <strong style="color: #0891b2;">METTRE À JOUR EN TEMPS RÉEL</strong> le statut dans votre tableau de bord pour informer le client
                    </li>
                    <li>
                        <strong style="color: #059669;">COORDONNER EFFICACEMENT</strong> la livraison selon l'adresse et les instructions fournies
                    </li>
                    <li>
                        <strong style="color: #dc2626;">CONTACTER LE CLIENT</strong> en cas de problème ou de retard imprévu
                    </li>
                </ol>
            </div>

            <!-- Contact Information -->
            <div class="contact-section">
                <h3 style="color: #1e40af; font-size: 22px; font-weight: 700; margin-bottom: 25px;">
                    📞 Informations de Contact Complètes
                </h3>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Contact Client Direct</div>
                        <div class="info-value">
                            <a href="mailto:${order.userEmail}" style="color: #3b82f6; text-decoration: none; font-weight: 700; display: block; margin-bottom: 8px;">
                                📧 ${order.userEmail}
                            </a>
                            ${order.userPhone ? `
                                <a href="tel:${order.userPhone}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">
                                    📱 ${order.userPhone}
                                </a>
                            ` : '<span style="color: #9ca3af;">📱 Téléphone non fourni</span>'}
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Support Technique Optimizi</div>
                        <div class="info-value">
                            <a href="mailto:${this.supportEmail}" style="color: #3b82f6; text-decoration: none; font-weight: 700; display: block; margin-bottom: 8px;">
                                📧 ${this.supportEmail}
                            </a>
                            <a href="tel:+21612345678" style="color: #3b82f6; text-decoration: none; font-weight: 700;">
                                📞 +216 12 345 678
                            </a>
                            <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">
                                Assistance 24/7 disponible
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Business Information -->
            <div class="section">
                <h2>
                    <span class="section-icon">🏢</span>
                    Informations de Votre Entreprise
                </h2>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Nom de l'Entreprise</div>
                        <div class="info-value">${supplierInfo.businessName}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Responsable</div>
                        <div class="info-value">${supplierInfo.name}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Adresse de l'Entreprise</div>
                        <div class="info-value" style="font-size: 14px; line-height: 1.4;">${supplierInfo.address}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Numéro Fiscal</div>
                        <div class="info-value" style="font-family: 'SF Mono', Monaco, monospace;">
                            ${supplierInfo.taxNumber || 'Non renseigné'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">
                🚀 OPTIMIZI
            </div>
            <p style="margin: 0 0 20px 0; font-weight: 600; font-size: 18px;">
                Plateforme E-commerce Professionnelle
            </p>
            <p style="margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
                Cet email a été envoyé automatiquement suite à une nouvelle commande sur votre boutique.<br>
                Pour toute assistance technique ou commerciale, notre équipe support est disponible 24/7.
            </p>
            <div style="border-top: 1px solid #4b5563; padding-top: 25px; font-size: 14px; opacity: 0.9;">
                <p style="margin: 0;">
                    © 2025 Optimizi. Tous droits réservés. | 
                    <a href="mailto:${this.supportEmail}" style="color: #93c5fd; text-decoration: none;">Support Technique</a> | 
                    <a href="${this.getDashboardUrl()}/profile" style="color: #93c5fd; text-decoration: none;">Préférences Email</a> |
                    <a href="${this.getDashboardUrl()}/notifications" style="color: #93c5fd; text-decoration: none;">Centre de Notifications</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Format order items for plain text with enhanced details
   */
  private formatOrderItemsText(items: OrderItem[]): string {
    if (!items || items.length === 0) {
      return 'Aucun article dans cette commande.';
    }

    return items.map((item, index) => {
      const itemNumber = (index + 1).toString().padStart(2, '0');
      return `${itemNumber}. ${item.productName}
    • Quantité commandée: ${item.quantity} ${item.unit || 'pièce(s)'}
    • Prix unitaire: TND${item.unitPrice.toFixed(2)}
    • Total pour cet article: TND${item.totalPrice.toFixed(2)}
    • ID Produit: ${item.productId}`;
    }).join('\n\n');
  }

  /**
   * Format order items for HTML with enhanced styling
   */
  private formatOrderItemsHtml(items: OrderItem[]): string {
    if (!items || items.length === 0) {
      return `
        <div class="item-row" style="text-align: center; color: #9ca3af; font-style: italic; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📦</div>
          <div style="font-size: 18px;">Aucun article dans cette commande.</div>
        </div>
      `;
    }

    return items.map((item, index) => `
      <div class="item-row">
        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 8px 12px; border-radius: 8px; font-weight: 700; color: #374151; margin-right: 20px; min-width: 40px; text-align: center;">
          ${index + 1}
        </div>
        <img src="${item.productImage || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}" 
             alt="${item.productName}" 
             class="item-image"
             onerror="this.src='https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'">
        <div class="item-details">
          <div class="item-name">${item.productName}</div>
          <div class="item-specs">
            <strong>Quantité:</strong> ${item.quantity} ${item.unit || 'pièce(s)'}<br>
            <strong>Prix unitaire:</strong> TND${item.unitPrice.toFixed(2)}<br>
            <strong>ID Produit:</strong> <span class="item-id">${item.productId}</span>
          </div>
        </div>
        <div class="item-total">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Total Article</div>
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

    let formatted = `📍 Adresse principale: ${address.street}`;
    if (address.address2) {
      formatted += `\n📍 Complément d'adresse: ${address.address2}`;
    }
    formatted += `\n🏙️ Ville: ${address.city}`;
    formatted += `\n📮 Code postal: ${address.postalCode}`;
    formatted += `\n🌍 Pays: ${address.country}`;
    
    if (address.instructions) {
      formatted += `\n\n📝 Instructions spéciales de livraison:\n"${address.instructions}"`;
    }
    
    return formatted;
  }

  /**
   * Format delivery address for HTML with enhanced styling
   */
  private formatDeliveryAddressHtml(address: DeliveryAddress): string {
    if (!address) {
      return `
        <div style="background: white; padding: 30px; border-radius: 16px; border: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-style: italic;">
          <div style="font-size: 48px; margin-bottom: 15px;">📍</div>
          <div style="font-size: 18px;">Adresse de livraison non spécifiée</div>
        </div>
      `;
    }

    return `
      <div style="background: white; padding: 30px; border-radius: 16px; border: 2px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div>
            <div class="info-label">Adresse Principale</div>
            <div style="font-weight: 700; color: #1f2937; font-size: 18px; display: flex; align-items: center;">
              <span style="margin-right: 10px; font-size: 20px;">🏠</span>
              ${address.street}
            </div>
          </div>
          ${address.address2 ? `
          <div>
            <div class="info-label">Complément d'Adresse</div>
            <div style="color: #6b7280; font-size: 16px; font-weight: 600;">
              ${address.address2}
            </div>
          </div>
          ` : ''}
          <div>
            <div class="info-label">Ville</div>
            <div style="color: #374151; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
              <span style="margin-right: 10px;">🏙️</span>
              ${address.city}
            </div>
          </div>
          <div>
            <div class="info-label">Code Postal</div>
            <div style="color: #374151; font-weight: 700; font-size: 18px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">📮</span>
              ${address.postalCode}
            </div>
          </div>
          <div>
            <div class="info-label">Pays</div>
            <div style="color: #374151; font-weight: 700; font-size: 18px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">🌍</span>
              ${address.country}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Send email via backend service with comprehensive error handling
   */
  private async sendEmailViaBackend(
    toEmail: string,
    toName: string,
    subject: string,
    textMessage: string,
    htmlMessage: string,
    order: Order,
    supplierInfo: any
  ): Promise<boolean> {
    try {
      if (!this.backendUrl) {
        console.error('❌ [SupplierNotificationService] Backend URL not configured');
        return false;
      }

      console.log(`📧 [SupplierNotificationService] Sending comprehensive email to: ${toEmail}`);
      console.log(`📧 [SupplierNotificationService] Subject: ${subject}`);

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
          customerEmail: order.userEmail,
          customerPhone: order.userPhone,
          fournisseurId: order.fournisseurId,
          fournisseurName: order.fournisseurName,
          createdAt: order.createdAt
        },
        supplier_metadata: {
          businessName: supplierInfo.businessName,
          contactName: supplierInfo.name,
          address: supplierInfo.address,
          taxNumber: supplierInfo.taxNumber,
          openingHours: supplierInfo.openingHours
        },
        notification_metadata: {
          type: 'supplier_order_notification',
          priority: this.getPriorityLevel(order.status),
          timestamp: new Date().toISOString(),
          version: '2.0'
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
        console.error('❌ [SupplierNotificationService] Backend email failed:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ [SupplierNotificationService] Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Error sending email via backend:', error);
      return false;
    }
  }

  /**
   * Create in-app notification for supplier dashboard
   */
  private async createInAppNotification(order: Order, supplierInfo: any): Promise<void> {
    try {
      const notificationData = {
        type: 'order',
        title: this.getInAppNotificationTitle(order.status),
        message: this.getInAppNotificationMessage(order),
        orderId: order.id,
        fournisseurId: order.fournisseurId,
        isRead: false,
        createdAt: new Date().toISOString(),
        orderData: {
          customerName: order.userName,
          customerEmail: order.userEmail,
          total: order.total || 0,
          itemCount: order.items?.length || 0,
          status: order.status,
          paymentStatus: order.paymentStatus
        },
        metadata: {
          businessName: supplierInfo.businessName,
          urgencyLevel: this.getPriorityLevel(order.status),
          requiresAction: this.requiresImmediateAction(order.status)
        }
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      console.log(`📱 [SupplierNotificationService] In-app notification created for order: ${order.id}`);
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Error creating in-app notification:', error);
    }
  }

  /**
   * Log notification events for comprehensive tracking
   */
  private async logNotificationEvent(
    order: Order, 
    supplierInfo: any | null, 
    status: 'success' | 'failed' | 'error'
  ): Promise<void> {
    try {
      const logData = {
        orderId: order.id,
        masterOrderId: (order as any).masterOrderId,
        fournisseurId: order.fournisseurId,
        fournisseurName: order.fournisseurName,
        supplierEmail: supplierInfo?.email || 'unknown',
        supplierBusinessName: supplierInfo?.businessName || 'unknown',
        customerName: order.userName,
        customerEmail: order.userEmail,
        orderTotal: order.total || 0,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        notificationStatus: status,
        timestamp: new Date().toISOString(),
        metadata: {
          itemCount: order.items?.length || 0,
          hasDeliveryInstructions: !!(order.deliveryAddress?.instructions),
          hasOrderNotes: !!order.orderNotes,
          paymentMethod: order.paymentMethod,
          urgencyLevel: this.getPriorityLevel(order.status),
          backendUrl: this.backendUrl,
          supportEmail: this.supportEmail
        }
      };

      await addDoc(collection(db, 'supplierNotificationLogs'), logData);
      console.log(`📊 [SupplierNotificationService] Event logged: ${status} for order: ${order.id}`);
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Error logging notification event:', error);
    }
  }

  /**
   * Send test notification with comprehensive test data
   */
  public async sendTestNotification(
    supplierEmail: string,
    supplierName: string = 'Test Supplier'
  ): Promise<boolean> {
    try {
      console.log(`🧪 [SupplierNotificationService] Sending comprehensive test notification to: ${supplierEmail}`);

      const testOrder: Order = {
        id: `test_order_${Date.now()}`,
        masterOrderId: `master_test_${Date.now()}`,
        fournisseurId: 'test_supplier_id',
        fournisseurName: supplierName,
        userId: 'test_user_12345',
        userEmail: 'jean.dupont@example.com',
        userName: 'Jean Dupont',
        userPhone: '+33 1 23 45 67 89',
        subtotal: 127.50,
        deliveryFee: 8.99,
        tax: 13.65,
        total: 150.14,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        deliveryAddress: {
          street: '123 Avenue des Champs-Élysées',
          address2: 'Appartement 4B, 2ème étage, Porte droite',
          city: 'Paris',
          postalCode: '75008',
          country: 'France',
          instructions: 'Sonner à la porte principale avec le code 1234. Ne pas laisser devant la porte. Client disponible après 18h en semaine et toute la journée le weekend. En cas d\'absence, laisser chez le concierge au rez-de-chaussée.'
        },
        orderNotes: 'Commande urgente pour un événement spécial ce soir. Livraison souhaitée avant 19h impérativement. Client allergique aux noix et aux fruits de mer - vérifier tous les ingrédients SVP. Préparation soignée demandée car c\'est pour des invités importants.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            productId: 'prod_pizza_margherita_001',
            productName: 'Pizza Margherita Artisanale (Pâte Fine, Basilic Frais)',
            productImage: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
            quantity: 2,
            unitPrice: 22.99,
            totalPrice: 45.98,
            unit: 'pièce'
          },
          {
            productId: 'prod_salade_cesar_002',
            productName: 'Salade César Fraîche avec Poulet Grillé Bio',
            productImage: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99,
            unit: 'portion'
          },
          {
            productId: 'prod_tiramisu_003',
            productName: 'Tiramisu Maison aux Amaretti et Café Arabica',
            productImage: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
            quantity: 4,
            unitPrice: 15.63,
            totalPrice: 62.52,
            unit: 'portion'
          }
        ]
      };

      const success = await this.sendOrderNotification(testOrder);
      
      if (success) {
        console.log(`✅ [SupplierNotificationService] Comprehensive test notification sent successfully to: ${supplierEmail}`);
      } else {
        console.error(`❌ [SupplierNotificationService] Comprehensive test notification failed for: ${supplierEmail}`);
      }

      return success;
    } catch (error) {
      console.error('❌ [SupplierNotificationService] Error sending comprehensive test notification:', error);
      return false;
    }
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    const configured = !!this.backendUrl;
    console.log('🔍 [SupplierNotificationService] Configuration check:', {
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

  // Enhanced helper methods
  private getPriorityPrefix(status: string): string {
    const highPriorityStatuses = ['pending', 'cancelled'];
    return highPriorityStatuses.includes(status) ? '[URGENT] ' : '';
  }

  private getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      'pending': '🆕',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'out_for_delivery': '🚚',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return emojiMap[status] || '📋';
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En Attente de Confirmation',
      'confirmed': 'Confirmée et Acceptée',
      'preparing': 'En Cours de Préparation',
      'out_for_delivery': 'En Cours de Livraison',
      'delivered': 'Livrée avec Succès',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  private getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En Attente de Paiement',
      'paid': 'Payé et Confirmé',
      'failed': 'Paiement Échoué',
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

  private getPaymentStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': '#f59e0b',
      'paid': '#10b981',
      'failed': '#ef4444',
      'refunded': '#8b5cf6'
    };
    return colorMap[status] || '#6b7280';
  }

  private getPriorityLevel(status: string): string {
    const priorityMap: Record<string, string> = {
      'pending': 'PRIORITÉ MAXIMALE',
      'confirmed': 'PRIORITÉ ÉLEVÉE',
      'preparing': 'PRIORITÉ NORMALE',
      'out_for_delivery': 'PRIORITÉ NORMALE',
      'delivered': 'PRIORITÉ BASSE',
      'cancelled': 'PRIORITÉ MAXIMALE'
    };
    return priorityMap[status] || 'PRIORITÉ NORMALE';
  }

  private getUrgencyLevel(status: string): string {
    const urgencyMap: Record<string, string> = {
      'pending': '🚨 URGENT - NOUVELLE COMMANDE',
      'confirmed': '⚡ IMPORTANT - COMMANDE CONFIRMÉE',
      'preparing': 'ℹ️ INFO - PRÉPARATION EN COURS',
      'out_for_delivery': 'ℹ️ INFO - LIVRAISON EN COURS',
      'delivered': '✅ SUCCÈS - COMMANDE LIVRÉE',
      'cancelled': '🚨 URGENT - COMMANDE ANNULÉE'
    };
    return urgencyMap[status] || 'ℹ️ INFO - MISE À JOUR COMMANDE';
  }

  private getStatusMessage(status: string, customerName: string, orderNumber: string): string {
    const messageMap: Record<string, string> = {
      'pending': `Vous avez reçu une nouvelle commande de ${customerName} qui nécessite votre confirmation immédiate.`,
      'confirmed': `La commande #${orderNumber} de ${customerName} a été confirmée et doit maintenant être préparée.`,
      'preparing': `La commande #${orderNumber} de ${customerName} est en cours de préparation.`,
      'out_for_delivery': `La commande #${orderNumber} de ${customerName} est maintenant en cours de livraison.`,
      'delivered': `La commande #${orderNumber} de ${customerName} a été livrée avec succès !`,
      'cancelled': `La commande #${orderNumber} de ${customerName} a été annulée et nécessite votre attention.`
    };
    return messageMap[status] || `Mise à jour de la commande #${orderNumber} de ${customerName}.`;
  }

  private getRequiredActions(status: string): string {
    const actionsMap: Record<string, string> = {
      'pending': `1. CONFIRMER la réception dans les 15 minutes
2. VÉRIFIER la disponibilité de tous les articles
3. CONTACTER le client si des articles ne sont pas disponibles
4. METTRE À JOUR le statut vers "confirmée"`,
      'confirmed': `1. COMMENCER la préparation immédiatement
2. RASSEMBLER tous les articles commandés
3. VÉRIFIER la qualité de chaque article
4. METTRE À JOUR le statut vers "en préparation"`,
      'preparing': `1. FINALISER la préparation de la commande
2. EMBALLER soigneusement tous les articles
3. PRÉPARER les documents de livraison
4. METTRE À JOUR le statut vers "en livraison"`,
      'out_for_delivery': `1. SUIVRE le processus de livraison
2. RESTER disponible pour le livreur
3. CONFIRMER la livraison une fois effectuée
4. METTRE À JOUR le statut vers "livrée"`,
      'delivered': `1. CONFIRMER que la livraison s'est bien passée
2. ARCHIVER la commande
3. DEMANDER un avis client si approprié`,
      'cancelled': `1. ARRÊTER toute préparation en cours
2. REMETTRE les articles en stock
3. CONTACTER le support si nécessaire
4. ARCHIVER la commande annulée`
    };
    return actionsMap[status] || 'Aucune action spécifique requise.';
  }

  private getHeaderTitle(status: string): string {
    const titleMap: Record<string, string> = {
      'pending': 'Nouvelle Commande Reçue',
      'confirmed': 'Commande Confirmée',
      'preparing': 'Préparation en Cours',
      'out_for_delivery': 'Livraison en Cours',
      'delivered': 'Commande Livrée',
      'cancelled': 'Commande Annulée'
    };
    return titleMap[status] || 'Mise à Jour Commande';
  }

  private shouldShowUrgentAlert(status: string): boolean {
    return ['pending', 'cancelled'].includes(status);
  }

  private getInAppNotificationTitle(status: string): string {
    const titleMap: Record<string, string> = {
      'pending': '🆕 Nouvelle commande reçue',
      'confirmed': '✅ Commande confirmée',
      'preparing': '👨‍🍳 Préparation en cours',
      'out_for_delivery': '🚚 En cours de livraison',
      'delivered': '🎉 Commande livrée',
      'cancelled': '❌ Commande annulée'
    };
    return titleMap[status] || '📋 Mise à jour commande';
  }

  private getInAppNotificationMessage(order: Order): string {
    const orderNumber = order.id.slice(-8).toUpperCase();
    const total = (order.total || 0).toFixed(2);
    
    const messageMap: Record<string, string> = {
      'pending': `Nouvelle commande #${orderNumber} de ${order.userName} - TND${total} - Confirmation requise`,
      'confirmed': `Commande #${orderNumber} confirmée - Préparation à commencer`,
      'preparing': `Commande #${orderNumber} en préparation - ${order.items?.length || 0} articles`,
      'out_for_delivery': `Commande #${orderNumber} en livraison vers ${order.userName}`,
      'delivered': `Commande #${orderNumber} livrée avec succès à ${order.userName}`,
      'cancelled': `Commande #${orderNumber} annulée - Vérifier les détails`
    };
    return messageMap[order.status] || `Commande #${orderNumber} mise à jour`;
  }

  private requiresImmediateAction(status: string): boolean {
    return ['pending', 'cancelled'].includes(status);
  }

  private getCustomerHistory(customerId: string): string {
    // This would typically query the database for customer history
    // For now, return a placeholder
    return 'Client régulier'; // Could be 'Nouveau client', 'Client VIP', etc.
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
export const supplierNotificationService = SupplierNotificationService.getInstance();