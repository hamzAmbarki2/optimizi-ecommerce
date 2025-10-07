# Supplier Notification System - Complete Setup Guide

## 🎯 Overview

This comprehensive supplier notification system automatically sends detailed email notifications to suppliers whenever:

- **🆕 New orders are placed** by clients
- **🔄 Order status changes** (confirmed, preparing, shipped, delivered, cancelled)
- **💳 Payment status updates** (paid, failed, pending, refunded)
- **📦 Inventory alerts** (low stock, out of stock)

## 📧 Email Content Features

Each supplier notification email includes:

### 📋 Order Information
- **Order number** and unique system ID
- **Date and time** of order placement
- **Order status** and payment status with visual badges
- **Priority level** and urgency indicators
- **Complete order timeline**

### 👤 Client Details
- **Full client name** and contact information
- **Email address** (clickable for direct contact)
- **Phone number** (clickable for direct calling)
- **Client account ID** and history
- **Billing and shipping addresses**

### 🛍️ Product Information
- **Complete item list** with product images
- **Quantities and unit prices** for each item
- **Product IDs** for inventory reference
- **Total values** per item and overall
- **Special product notes** or customizations

### 💰 Financial Summary
- **Itemized pricing breakdown**
- **Delivery fees and taxes**
- **Applied discounts or promotions**
- **Total amount** to be received
- **Payment method** and status

### 📍 Delivery Details
- **Complete delivery address** with formatting
- **Special delivery instructions** from client
- **Estimated delivery timeframes**
- **Contact information** for delivery coordination

### ⚡ Action Items
- **Required immediate actions** with deadlines
- **Step-by-step workflow** for order processing
- **Direct links** to dashboard and client contact
- **Emergency contact information**

## 🚀 Quick Setup (5 Minutes)

### Step 1: Start the Email Backend Server

```bash
cd "supplier (2)/project/server"
npm install
cp .env.example .env
# Edit .env with your Gmail credentials (see below)
npm run dev
```

### Step 2: Configure Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Factor Authentication** (required)
3. Go to **"App passwords"** section
4. Generate password for **"Mail"**
5. Copy the 16-character password (remove spaces)

### Step 3: Update Backend .env File

```env
# supplier (2)/project/server/.env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
FROM_NAME=Optimizi
PORT=4001
ALLOW_SELF_SIGNED=true
```

### Step 4: Configure Frontend Environment

```env
# supplier (2)/project/.env
VITE_EMAIL_BACKEND_URL=http://localhost:4001
VITE_SUPPLIER_SUPPORT_EMAIL=your-email@gmail.com
```

### Step 5: Test the System

```bash
cd "supplier (2)/project"
npm run dev
# Navigate to /email-test in your browser
```

## 🧪 Testing the System

### Automated Tests Available

1. **Configuration Check** - Verifies all environment variables
2. **Backend Connection Test** - Tests email server connectivity
3. **Email Sending Test** - Sends a real test email
4. **Complete System Test** - Tests end-to-end functionality
5. **Monitoring Status** - Shows real-time system health

### Test Email Content

The test email includes:
- **Realistic order data** with multiple products
- **Complete client information** with contact details
- **Detailed delivery address** with special instructions
- **Financial breakdown** with taxes and fees
- **Professional HTML formatting** with responsive design

### Manual Testing Steps

1. **Access Test Interface**: Navigate to `/email-test` in supplier dashboard
2. **Check Configuration**: Click "Vérifier la Configuration"
3. **Test Connection**: Click "Tester la Connexion"
4. **Send Test Email**: Enter your email and click "Envoyer Email de Test"
5. **Verify Receipt**: Check your inbox for the test notification

## 🔧 Advanced Configuration

### Email Template Customization

The system includes multiple email templates for different order statuses:

- **New Order** (`pending`) - High priority, urgent action required
- **Order Confirmed** (`confirmed`) - Preparation instructions
- **Preparing** (`preparing`) - Progress update
- **Out for Delivery** (`out_for_delivery`) - Shipping notification
- **Delivered** (`delivered`) - Success confirmation
- **Cancelled** (`cancelled`) - Cancellation alert

### HTML Email Features

- **Responsive design** that works on all devices
- **Professional styling** with gradients and shadows
- **Interactive elements** (clickable phone numbers, email addresses)
- **Status badges** with color coding
- **Priority indicators** for urgent orders
- **Action buttons** for quick dashboard access

### Error Handling

The system includes comprehensive error handling:

- **Connection failures** - Automatic retry logic
- **Invalid email addresses** - Validation and logging
- **Backend errors** - Detailed error reporting
- **Configuration issues** - Clear diagnostic messages
- **Rate limiting** - Prevents email spam

## 📊 Monitoring and Analytics

### Real-time Monitoring

- **Active listeners** for each supplier
- **Processed order count** tracking
- **System health status** monitoring
- **Last activity timestamps** per supplier

### Notification Statistics

- **Total notifications sent** per supplier
- **Success/failure rates** with detailed logs
- **Average response times** for email delivery
- **Client engagement metrics**

### Logging and Debugging

All notification events are logged with:
- **Order details** and metadata
- **Supplier information** and contact data
- **Email delivery status** and timestamps
- **Error details** for failed notifications
- **System performance metrics**

## 🔒 Security Features

### Email Security
- **Gmail App Passwords** for secure authentication
- **TLS encryption** for email transmission
- **Input validation** to prevent injection attacks
- **Rate limiting** to prevent abuse

### Data Protection
- **Sensitive data masking** in logs
- **Secure credential storage** in environment variables
- **Access control** for notification preferences
- **Audit trails** for all notification events

## 🚨 Troubleshooting

### Common Issues and Solutions

**1. "Backend connection failed"**
- ✅ Ensure email server is running: `npm run dev` in server directory
- ✅ Check VITE_EMAIL_BACKEND_URL in frontend .env
- ✅ Verify port 4001 is not blocked by firewall

**2. "Gmail authentication failed"**
- ✅ Use Gmail App Password, not regular password
- ✅ Enable 2-Factor Authentication on Gmail account
- ✅ Remove all spaces from App Password
- ✅ Verify Gmail address is correct

**3. "Emails not being received"**
- ✅ Check spam/junk folders
- ✅ Verify recipient email address
- ✅ Check Gmail "Sent" folder to confirm sending
- ✅ Test with different email providers

**4. "Configuration not found"**
- ✅ Create .env files in correct directories
- ✅ Restart development servers after .env changes
- ✅ Check environment variable names (case-sensitive)

### Debug Commands

```bash
# Test email configuration
cd "supplier (2)/project/server"
npm run debug

# Test basic email sending
npm run test

# Check server health
curl http://localhost:4001/health

# Send test email via API
curl -X POST http://localhost:4001/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email from Optimizi"
  }'
```

## 🎉 Success Indicators

You'll know the system is working when:

- ✅ **Configuration check** shows all green checkmarks
- ✅ **Backend connection** test passes
- ✅ **Test emails** arrive in your inbox within 30 seconds
- ✅ **Real order notifications** are sent automatically
- ✅ **Monitoring dashboard** shows active listeners
- ✅ **Email logs** show successful deliveries

## 📈 Production Deployment

### Environment Variables for Production

```env
# Production Backend
GMAIL_USER=production-email@yourdomain.com
GMAIL_APP_PASSWORD=your_production_app_password
FROM_NAME=Your Business Name
PORT=4001
NODE_ENV=production

# Production Frontend
VITE_EMAIL_BACKEND_URL=https://your-api-domain.com
VITE_SUPPLIER_SUPPORT_EMAIL=support@yourdomain.com
```

### Scaling Considerations

- **Email rate limits** - Gmail allows 500 emails/day for free accounts
- **Server resources** - Monitor CPU and memory usage
- **Database connections** - Optimize Firestore queries
- **Error handling** - Implement retry logic and fallbacks
- **Monitoring** - Set up alerts for system failures

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting guide** above
2. **Run the debug script**: `npm run debug` in server directory
3. **Review server logs** for detailed error messages
4. **Test with the email test interface** at `/email-test`
5. **Verify Gmail App Password** is correct and active

## 🔄 System Architecture

```
Client Places Order
       ↓
Order stored in Firebase
       ↓
Real-time listener detects new order
       ↓
Supplier notification service triggered
       ↓
Email content generated with templates
       ↓
Email sent via Node.js backend (Nodemailer + Gmail)
       ↓
Supplier receives comprehensive notification
       ↓
In-app notification created in dashboard
       ↓
Event logged for analytics and debugging
```

---

**🎯 Ready to get started?** Follow the quick setup steps above and your suppliers will be receiving detailed, professional order notifications within minutes!