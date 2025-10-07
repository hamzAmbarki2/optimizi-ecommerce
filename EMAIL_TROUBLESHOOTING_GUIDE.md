# Email Troubleshooting Guide for Optimizi

## 🚨 Quick Fix Checklist

If supplier notification emails are not being sent, follow these steps in order:

### 1. Check Email Server Status
```bash
cd "supplier (2)/project/server"
npm run debug
```

This will test your email configuration step by step and verify Gmail connectivity.

### 2. Verify Gmail App Password Setup

**CRITICAL**: You MUST use a Gmail App Password, not your regular Gmail password.

#### Steps to create Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Factor Authentication** (required for App Passwords)
3. Go to **"App passwords"** section
4. Select **"Mail"** as the app type
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
6. **Remove all spaces** when adding to `.env` file

#### Common App Password Issues:
- ❌ Using regular Gmail password instead of App Password
- ❌ App Password contains spaces
- ❌ 2FA not enabled on Gmail account
- ❌ Wrong Gmail address

### 3. Configure Environment Variables

Create/update `supplier (2)/project/server/.env`:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
FROM_NAME=Optimizi
PORT=4001
ALLOW_SELF_SIGNED=true
```

**Important**: 
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with your actual 16-character App Password (no spaces)

### 4. Test Email Configuration

```bash
cd "supplier (2)/project/server"
npm run test
```

You should receive a test email in your Gmail inbox.

### 5. Start Email Server

```bash
cd "supplier (2)/project/server"
npm run dev
```

Look for these success messages:
```
✅ Gmail SMTP transporter verified and ready
🚀 Optimizi Email Server running on port 4001
✅ Email service is ACTIVE and ready to send emails
```

### 6. Configure Frontend Environment Variables

**Client Frontend** (`client/project/.env`):
```env
VITE_EMAIL_BACKEND_URL=http://localhost:4001
```

**Supplier Frontend** (`supplier (2)/project/.env`):
```env
VITE_EMAIL_BACKEND_URL=http://localhost:4001
VITE_SUPPLIER_SUPPORT_EMAIL=your-email@gmail.com
```

### 7. Test End-to-End Email Flow

1. **Start the email server**:
   ```bash
   cd "supplier (2)/project/server"
   npm run dev
   ```

2. **Start the supplier frontend**:
   ```bash
   cd "supplier (2)/project"
   npm run dev
   ```

3. **Test the notification system**:
   - Navigate to `/email-test` in the supplier dashboard
   - Run configuration and connection tests
   - Send a test email to verify functionality

4. **Test with real orders** (if client is also running):
   ```bash
   cd "client/project"
   npm run dev
   ```
   - Place an order through the client interface
   - Check supplier email for order notification
   - Update order status through supplier interface
   - Verify notifications are sent for status changes

## 🔧 Common Issues and Solutions

### Issue 1: "Authentication failed" Error
**Cause**: Wrong Gmail credentials
**Solution**: 
- Verify Gmail address is correct
- Generate a new App Password
- Ensure 2FA is enabled

### Issue 2: "Connection timeout" Error
**Cause**: Network/firewall issues
**Solution**:
- Check internet connection
- Disable antivirus/firewall temporarily
- Try different SMTP configuration

### Issue 3: Emails not received but no errors
**Cause**: Emails going to spam or wrong address
**Solution**:
- Check spam/junk folders
- Verify recipient email addresses
- Check Gmail "Sent" folder to confirm emails are being sent

### Issue 4: "Invalid login" Error
**Cause**: Using regular password instead of App Password
**Solution**:
- Create Gmail App Password
- Use App Password in .env file
- Remove all spaces from App Password

### Issue 5: Server not starting
**Cause**: Missing dependencies or port conflicts
**Solution**:
```bash
cd "supplier (2)/project/server"
npm install
# Try different port if 4001 is busy
PORT=4002 npm run dev
```

### Issue 6: Supplier notifications not working but client emails work
**Cause**: Frontend environment variables not configured
**Solution**:
- Check `supplier (2)/project/.env` file exists
- Verify VITE_EMAIL_BACKEND_URL points to email server
- Restart supplier frontend after .env changes

### Issue 7: HTML emails not displaying correctly
**Cause**: Email client compatibility issues
**Solution**:
- Test with different email clients (Gmail, Outlook, Apple Mail)
- Check spam folder settings
- Verify HTML template syntax in browser first

## 🧪 Debug Commands

### Test Email Configuration
```bash
cd "supplier (2)/project/server"
npm run debug
```

### Test Basic Email Sending
```bash
cd "supplier (2)/project/server"
npm run test
```

### Test Supplier Notification System
```bash
# In supplier dashboard, navigate to:
# http://localhost:5173/email-test
# Run all available tests
```

### Check Server Health
```bash
curl http://localhost:4001/health
```

### Send Test Supplier Email via API
```bash
curl -X POST http://localhost:4001/send-supplier-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "to_name": "Test Supplier",
    "subject": "🧪 Test Supplier Notification",
    "message": "This is a test supplier notification email",
    "order_metadata": {
      "id": "test123",
      "total": 50.00,
      "status": "pending",
      "customerName": "Test Customer"
    }
  }'
```

## 📧 Email Flow Architecture

```
Client Places Order
       ↓
Order stored in Firebase (subOrders collection)
       ↓
Real-time listener detects order change
       ↓
Supplier notification service processes order
       ↓
Enhanced email content generated with templates
       ↓
Email sent via Node.js backend (Nodemailer + Gmail)
       ↓
Supplier receives comprehensive notification email
       ↓
In-app notification created in supplier dashboard
       ↓
Event logged for analytics and monitoring
```

## 🔍 Debugging Steps

1. **Check server logs** for error messages
2. **Run supplier notification tests** in `/email-test` dashboard
3. **Verify Gmail credentials** using debug script
4. **Test email sending** with comprehensive test script
5. **Check network connectivity** to Gmail SMTP
6. **Verify frontend configuration** points to correct backend URL
7. **Test API endpoints** manually with curl
8. **Check email delivery** in Gmail sent folder and recipient inbox
9. **Monitor real-time listeners** in browser console
10. **Review notification logs** in Firebase console

## 📞 Still Having Issues?

If you're still experiencing problems:

1. Run the debug script: `npm run debug`
2. Test the complete system in `/email-test` dashboard
3. Check the server logs for specific error messages
4. Verify your Gmail App Password is correct
5. Try generating a new App Password
6. Check if your Gmail account has any security restrictions
7. Verify both frontend and backend .env files are configured
8. Test with a different email address to rule out recipient issues

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ Debug script shows "EMAIL CONFIGURATION IS WORKING!"
- ✅ Server logs show "Enhanced email service configured successfully"
- ✅ `/email-test` dashboard shows all green checkmarks
- ✅ Test emails arrive in your Gmail inbox with professional formatting
- ✅ Real order notifications are sent automatically to suppliers
- ✅ In-app notifications appear in supplier dashboard
- ✅ Notification logs show successful delivery events
- ✅ Monitoring dashboard shows active listeners and system health

## 🔄 System Health Monitoring
---

### Real-time Monitoring Available
- **Active listeners** per supplier
- **Processed order count** tracking
- **Email delivery success rates**
- **System health status** indicators
- **Last activity timestamps**

### Access Monitoring
- Navigate to `/email-test` in supplier dashboard
- Check "Statut de la Surveillance" section
- Review notification statistics and system health

**Need more help?** 
1. Check the server logs and run the debug script for detailed diagnostics
2. Use the comprehensive test interface at `/email-test` 
3. Review the detailed setup guide in `SUPPLIER_NOTIFICATION_SETUP.md`
4. Monitor system health in real-time through the dashboard