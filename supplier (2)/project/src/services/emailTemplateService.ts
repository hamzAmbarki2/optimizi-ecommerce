import { EnhancedNotification } from '../types/notifications';

export class EmailTemplateService {
  // Generate HTML email template for notifications
  static generateEmailTemplate(notification: EnhancedNotification, fournisseurName: string): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
          .content { padding: 30px; }
          .notification-card { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .priority-high { border-left-color: #ef4444; background-color: #fef2f2; }
          .priority-medium { border-left-color: #f59e0b; background-color: #fffbeb; }
          .priority-low { border-left-color: #10b981; background-color: #f0fdf4; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .data-table th, .data-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .data-table th { background-color: #f9fafb; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VendorHub Notification</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Hello ${fournisseurName}</p>
          </div>
          
          <div class="content">
            <div class="notification-card priority-${notification.priority}">
              <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">${notification.title}</h2>
              <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">${notification.message}</p>
              
              ${this.generateNotificationSpecificContent(notification)}
              
              <div style="margin-top: 20px;">
                <a href="${this.generateActionUrl(notification)}" class="button">
                  ${this.getActionButtonText(notification)}
                </a>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Quick Actions</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                You can manage your notification preferences in your dashboard settings.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent by VendorHub. If you no longer wish to receive these notifications, you can update your preferences in your dashboard.</p>
            <p style="margin-top: 10px;">© 2025 VendorHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  // Generate notification-specific content
  private static generateNotificationSpecificContent(notification: EnhancedNotification): string {
    switch (notification.type) {
      case 'order':
        return this.generateOrderContent(notification);
      case 'payment':
        return this.generatePaymentContent(notification);
      case 'inventory':
        return this.generateInventoryContent(notification);
      case 'product':
        return this.generateProductContent(notification);
      case 'system':
        return this.generateSystemContent(notification);
      default:
        return '';
    }
  }

  private static generateOrderContent(notification: EnhancedNotification): string {
    const data = notification.data || {};
    
    return `
      <table class="data-table">
        <tr>
          <th>Customer</th>
          <td>${data.customerName || 'N/A'}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>${data.customerEmail || 'N/A'}</td>
        </tr>
        <tr>
          <th>Order Total</th>
          <td>TND${data.orderTotal?.toFixed(2) || '0.00'}</td>
        </tr>
        <tr>
          <th>Items</th>
          <td>${data.itemCount || 0} item(s)</td>
        </tr>
        <tr>
          <th>Status</th>
          <td style="text-transform: capitalize;">${data.orderStatus || 'Unknown'}</td>
        </tr>
        <tr>
          <th>Payment</th>
          <td style="text-transform: capitalize;">${data.paymentStatus || 'Unknown'}</td>
        </tr>
      </table>
    `;
  }

  private static generatePaymentContent(notification: EnhancedNotification): string {
    const data = notification.data || {};
    
    return `
      <table class="data-table">
        <tr>
          <th>Amount</th>
          <td>TND${data.amount?.toFixed(2) || '0.00'}</td>
        </tr>
        <tr>
          <th>Payment Method</th>
          <td style="text-transform: capitalize;">${data.paymentMethod || 'N/A'}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td style="text-transform: capitalize;">${data.newPaymentStatus || data.paymentStatus || 'Unknown'}</td>
        </tr>
        ${data.customerName ? `
        <tr>
          <th>Customer</th>
          <td>${data.customerName}</td>
        </tr>
        ` : ''}
      </table>
    `;
  }

  private static generateInventoryContent(notification: EnhancedNotification): string {
    const data = notification.data || {};
    
    return `
      <table class="data-table">
        <tr>
          <th>Product</th>
          <td>${data.productName || 'N/A'}</td>
        </tr>
        <tr>
          <th>Current Stock</th>
          <td>${data.currentStock || 0} ${data.unit || 'units'}</td>
        </tr>
        ${data.threshold ? `
        <tr>
          <th>Threshold</th>
          <td>${data.threshold} ${data.unit || 'units'}</td>
        </tr>
        ` : ''}
        ${data.lastRestockDate ? `
        <tr>
          <th>Last Restock</th>
          <td>${new Date(data.lastRestockDate).toLocaleDateString()}</td>
        </tr>
        ` : ''}
      </table>
    `;
  }

  private static generateProductContent(notification: EnhancedNotification): string {
    const data = notification.data || {};
    
    return `
      <table class="data-table">
        <tr>
          <th>Product</th>
          <td>${data.productName || 'N/A'}</td>
        </tr>
        ${data.rating ? `
        <tr>
          <th>Rating</th>
          <td>${data.rating}/5 stars</td>
        </tr>
        ` : ''}
        ${data.reviewText ? `
        <tr>
          <th>Review</th>
          <td>"${data.reviewText}"</td>
        </tr>
        ` : ''}
        ${data.customerName ? `
        <tr>
          <th>Customer</th>
          <td>${data.customerName}</td>
        </tr>
        ` : ''}
      </table>
    `;
  }

  private static generateSystemContent(notification: EnhancedNotification): string {
    const data = notification.data || {};
    
    if (data.maintenanceWindow) {
      return `
        <table class="data-table">
          <tr>
            <th>Maintenance Start</th>
            <td>${new Date(data.maintenanceWindow.start).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Maintenance End</th>
            <td>${new Date(data.maintenanceWindow.end).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Expected Duration</th>
            <td>${data.maintenanceWindow.duration || 'TBD'}</td>
          </tr>
        </table>
      `;
    }
    
    return '';
  }

  // Generate action URL based on notification type
  private static generateActionUrl(notification: EnhancedNotification): string {
    const baseUrl = window.location.origin;
    
    switch (notification.type) {
      case 'order':
        return notification.orderId 
          ? `${baseUrl}/orders?highlight=${notification.orderId}`
          : `${baseUrl}/orders`;
      case 'payment':
        return `${baseUrl}/orders`;
      case 'inventory':
      case 'product':
        return notification.productId
          ? `${baseUrl}/products?highlight=${notification.productId}`
          : `${baseUrl}/products`;
      case 'system':
        return `${baseUrl}/notifications`;
      default:
        return `${baseUrl}/notifications`;
    }
  }

  // Get action button text based on notification type
  private static getActionButtonText(notification: EnhancedNotification): string {
    switch (notification.type) {
      case 'order':
        return 'View Order Details';
      case 'payment':
        return 'Check Payment Status';
      case 'inventory':
        return 'Manage Inventory';
      case 'product':
        return 'View Product';
      case 'system':
        return 'View System Updates';
      default:
        return 'View Details';
    }
  }

  // Generate plain text version for email clients that don't support HTML
  static generateTextTemplate(notification: EnhancedNotification, fournisseurName: string): string {
    return `
VendorHub Notification
Hello ${fournisseurName},

${notification.title}

${notification.message}

${this.generateTextSpecificContent(notification)}

Priority: ${notification.priority.toUpperCase()}
Type: ${notification.type.toUpperCase()}
Time: ${new Date(notification.createdAt).toLocaleString()}

To view more details, please visit your VendorHub dashboard.

Best regards,
The VendorHub Team

---
This email was sent by VendorHub. You can manage your notification preferences in your dashboard settings.
    `.trim();
  }

  private static generateTextSpecificContent(notification: EnhancedNotification): string {
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'order':
        return `
Order Details:
- Customer: ${data.customerName || 'N/A'}
- Email: ${data.customerEmail || 'N/A'}
- Total: TND${data.orderTotal?.toFixed(2) || '0.00'}
- Items: ${data.itemCount || 0}
- Status: ${data.orderStatus || 'Unknown'}
- Payment: ${data.paymentStatus || 'Unknown'}
        `.trim();
        
      case 'payment':
        return `
Payment Details:
- Amount: TND${data.amount?.toFixed(2) || '0.00'}
- Method: ${data.paymentMethod || 'N/A'}
- Status: ${data.newPaymentStatus || data.paymentStatus || 'Unknown'}
${data.customerName ? `- Customer: ${data.customerName}` : ''}
        `.trim();
        
      case 'inventory':
        return `
Inventory Details:
- Product: ${data.productName || 'N/A'}
- Current Stock: ${data.currentStock || 0} ${data.unit || 'units'}
${data.threshold ? `- Threshold: ${data.threshold} ${data.unit || 'units'}` : ''}
        `.trim();
        
      case 'product':
        return `
Product Details:
- Product: ${data.productName || 'N/A'}
${data.rating ? `- Rating: ${data.rating}/5 stars` : ''}
${data.customerName ? `- Customer: ${data.customerName}` : ''}
        `.trim();
        
      default:
        return '';
    }
  }

  // Generate email subject based on notification
  static generateEmailSubject(notification: EnhancedNotification): string {
    const priorityPrefix = notification.priority === 'high' ? '[URGENT] ' : '';
    
    switch (notification.type) {
      case 'order':
        return `${priorityPrefix}${notification.title} - Order #${notification.orderId?.slice(-8) || 'N/A'}`;
      case 'payment':
        return `${priorityPrefix}${notification.title} - Payment Update`;
      case 'inventory':
        return `${priorityPrefix}${notification.title} - Inventory Alert`;
      case 'product':
        return `${priorityPrefix}${notification.title} - Product Update`;
      case 'system':
        return `${priorityPrefix}${notification.title} - System Notification`;
      default:
        return `${priorityPrefix}${notification.title}`;
    }
  }

  // Generate digest email for multiple notifications
  static generateDigestTemplate(
    notifications: EnhancedNotification[], 
    fournisseurName: string,
    period: 'daily' | 'weekly'
  ): string {
    const periodText = period === 'daily' ? 'Daily' : 'Weekly';
    const groupedNotifications = this.groupNotificationsByType(notifications);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${periodText} Notification Digest</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
          .content { padding: 30px; }
          .section { margin: 30px 0; }
          .section h3 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .notification-item { padding: 15px; margin: 10px 0; background-color: #f8fafc; border-radius: 8px; border-left: 3px solid #3b82f6; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${periodText} Notification Digest</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Hello ${fournisseurName}</p>
          </div>
          
          <div class="content">
            <p>Here's your ${period} summary of business notifications:</p>
            
            <div class="stats-grid">
              <div class="stat-card">
                <h4 style="margin: 0; color: #3b82f6;">${notifications.length}</h4>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Total Notifications</p>
              </div>
              <div class="stat-card">
                <h4 style="margin: 0; color: #ef4444;">${notifications.filter(n => n.priority === 'high').length}</h4>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">High Priority</p>
              </div>
              <div class="stat-card">
                <h4 style="margin: 0; color: #10b981;">${notifications.filter(n => n.type === 'order').length}</h4>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">New Orders</p>
              </div>
              <div class="stat-card">
                <h4 style="margin: 0; color: #8b5cf6;">${notifications.filter(n => n.type === 'payment').length}</h4>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Payments</p>
              </div>
            </div>
            
            ${Object.entries(groupedNotifications).map(([type, typeNotifications]) => `
              <div class="section">
                <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Notifications (${typeNotifications.length})</h3>
                ${typeNotifications.slice(0, 5).map(notification => `
                  <div class="notification-item">
                    <h4 style="margin: 0 0 5px 0; color: #1f2937;">${notification.title}</h4>
                    <p style="margin: 0; color: #4b5563; font-size: 14px;">${notification.message}</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                      ${new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                `).join('')}
                ${typeNotifications.length > 5 ? `
                  <p style="text-align: center; color: #6b7280; font-style: italic;">
                    ... and ${typeNotifications.length - 5} more ${type} notifications
                  </p>
                ` : ''}
              </div>
            `).join('')}
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${window.location.origin}/notifications" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                View All Notifications
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This ${period} digest was sent by VendorHub. You can adjust your digest preferences in your dashboard settings.</p>
            <p style="margin-top: 10px;">© 2025 VendorHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static groupNotificationsByType(notifications: EnhancedNotification[]): Record<string, EnhancedNotification[]> {
    return notifications.reduce((groups, notification) => {
      const type = notification.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(notification);
      return groups;
    }, {} as Record<string, EnhancedNotification[]>);
  }
}