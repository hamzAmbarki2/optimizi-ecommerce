# Supplier Email Notifications Setup Guide

This guide will help you set up email notifications for suppliers to receive detailed order information via EmailJS.

## 🎯 What You'll Get

Suppliers will receive **detailed email notifications** for:

- **🆕 New Orders** - Complete order details, customer info, items, delivery address
- **✅ Order Confirmations** - When orders are confirmed and ready for preparation
- **👨‍🍳 Order Preparation** - When orders are being prepared
- **🚚 Order Shipping** - When orders are out for delivery
- **🎉 Order Delivery** - When orders are successfully delivered
- **❌ Order Cancellations** - When orders are cancelled

## 📧 Email Content Includes

Each email contains:
- **Order Details**: Order number, status, total amount
- **Customer Information**: Name, email, phone number
- **Product Details**: Item names, quantities, prices, units
- **Delivery Information**: Complete delivery address
- **Order Notes**: Any special instructions from customers
- **Professional Formatting**: Beautiful HTML emails with your branding

## 🚀 Quick Setup Steps

### Step 1: Create EmailJS Account (FREE)

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook/Hotmail**
   - **Custom SMTP**
4. Follow the setup instructions for your chosen provider
5. **Important**: Note down your **Service ID**

### Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```html
Subject: {{subject}}

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">Optimizi - Notification de Commande</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1f2937; margin-top: 0;">{{message}}</h2>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #374151; margin-top: 0;">Détails de la Commande</h3>
                <p><strong>Numéro de commande:</strong> {{order_id}}</p>
                <p><strong>Statut:</strong> {{status}}</p>
                <p><strong>Client:</strong> {{customer_name}}</p>
                <p><strong>Email:</strong> {{customer_email}}</p>
                <p><strong>Téléphone:</strong> {{customer_phone}}</p>
                <p><strong>Montant total:</strong> TND{{order_total}}</p>
                <p><strong>Nombre d'articles:</strong> {{item_count}}</p>
                <p><strong>Adresse de livraison:</strong> {{delivery_address}}</p>
                <p><strong>Notes:</strong> {{order_notes}}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #374151; margin-top: 0;">Articles Commandés</h3>
                <div style="white-space: pre-line;">{{order_items}}</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Ceci est un message automatique. Merci de ne pas y répondre.</p>
            <p>© 2025 Optimizi. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
```

4. Save the template and note the **Template ID**

### Step 4: Get Your Public Key

1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (also called User ID)
3. Note this down

### Step 5: Configure Environment Variables

1. In your project root, create a file named `.env`
2. Copy the content from `.env.example`
3. Replace the placeholder values with your actual EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_actual_service_id
VITE_EMAILJS_SUPPLIER_ORDER_TEMPLATE_ID=your_actual_template_id
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
VITE_SUPPLIER_SUPPORT_EMAIL=your_actual_support_email
```

### Step 6: Update Supplier Email Function

You need to implement the `getSupplierEmail` function in `supplierEmailService.ts` to fetch actual supplier emails from your database.

**Current placeholder:**
```typescript
private getSupplierEmail(supplierId: string): string {
  return 'supplier@example.com'; // Replace with actual implementation
}
```

**Example implementation:**
```typescript
private async getSupplierEmail(supplierId: string): Promise<string> {
  try {
    const supplierDoc = await getDoc(doc(db, 'fournisseurs', supplierId));
    if (supplierDoc.exists()) {
      return supplierDoc.data().email || 'default@example.com';
    }
    return 'default@example.com';
  } catch (error) {
    console.error('Error fetching supplier email:', error);
    return 'default@example.com';
  }
}
```

## 🧪 Testing the Setup

### Test 1: Check Configuration
```typescript
import { supplierEmailService } from './src/services/supplierEmailService';

// Check if email service is configured
const configStatus = supplierEmailService.getConfigStatus();
console.log('Email service configured:', configStatus.isConfigured);
console.log('Missing fields:', configStatus.missingFields);
```

### Test 2: Test Email Sending
```typescript
// Initialize the service
supplierEmailService.initialize();

// Test with a mock order
const testOrder = {
  id: 'test123',
  fournisseurId: 'supplier123',
  fournisseurName: 'Test Supplier',
  // ... other order properties
};

const result = await supplierEmailService.sendOrderNotification(testOrder);
console.log('Email sent:', result);
```

## 📋 Email Template Variables

Your EmailJS template can use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{subject}}` | Email subject line | "🆕 Nouvelle Commande Reçue - #ABC12345" |
| `{{message}}` | Main email message | "Bonjour Test Supplier, Vous avez reçu une nouvelle commande !" |
| `{{order_id}}` | Order number | "ABC12345" |
| `{{status}}` | Order status | "pending" |
| `{{customer_name}}` | Customer name | "John Doe" |
| `{{customer_email}}` | Customer email | "john@example.com" |
| `{{customer_phone}}` | Customer phone | "+1234567890" |
| `{{order_total}}` | Order total amount | "45.99" |
| `{{item_count}}` | Number of items | "3" |
| `{{delivery_address}}` | Delivery address | "123 Main St, City, 12345, Country" |
| `{{order_items}}` | Formatted order items | "• Product 1 - Quantity: 2 - Price: TND15.99" |
| `{{order_notes}}` | Order notes | "Please deliver before 6 PM" |

## 🔧 Customization Options

### 1. Email Templates
- Modify the HTML template in EmailJS dashboard
- Add your company logo and branding
- Change colors and styling
- Add additional variables

### 2. Email Content
- Edit the message templates in `supplierEmailService.ts`
- Add new order status types
- Modify email subjects and content
- Change language (currently French)

### 3. Notification Triggers
- Modify when emails are sent in `enhancedNotificationService.ts`
- Add new notification types
- Change email priority settings

## 🚨 Troubleshooting

### Common Issues

1. **"EmailJS not configured" warning**
   - Check that all environment variables are set correctly
   - Ensure `.env` file is in the project root
   - Restart your development server after adding environment variables

2. **Emails not sending**
   - Verify your EmailJS service is properly connected to your email provider
   - Check the browser console for error messages
   - Ensure your email provider allows third-party applications

3. **Template errors**
   - Make sure template IDs match exactly (case-sensitive)
   - Verify template variables are correctly named
   - Test templates directly in EmailJS dashboard

### Email Provider Specific Notes

**Gmail:**
- You may need to enable "Less secure app access" or use App Passwords
- Consider using a dedicated Gmail account for sending emails

**Outlook/Hotmail:**
- Usually works without additional configuration
- May have sending limits on free accounts

## 📊 Monitoring and Analytics

EmailJS provides:
- Email delivery status
- Open rates (if enabled)
- Click tracking (if enabled)
- Usage statistics

Access these in your EmailJS dashboard under "Statistics".

## 💰 Pricing

- **Free Plan**: 200 emails/month
- **Paid Plans**: Starting at $15/month for higher limits
- **No code changes required** when upgrading

## 🎉 What Happens Next

Once configured, suppliers will automatically receive:

1. **Immediate notification** when new orders are placed
2. **Status updates** as orders progress through the system
3. **Complete order details** including customer information and delivery address
4. **Professional formatted emails** that match your brand

## 📞 Support

If you encounter issues:
1. Check EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. Review browser console for error messages
3. Test email templates directly in EmailJS dashboard
4. Contact EmailJS support for service-specific issues

---

**Ready to get started?** Follow the steps above and your suppliers will be receiving detailed order notifications in no time! 🚀