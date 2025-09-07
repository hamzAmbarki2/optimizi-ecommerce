# Optimizi Supplier Email Backend

This small Express server receives POST requests from the frontend and sends emails using Gmail SMTP via Nodemailer.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Gmail credentials
   ```

3. **Test email configuration:**
   ```bash
   node test-email.js
   ```

4. **Start the server:**
   ```bash
   npm run dev  # Development with auto-reload
   # OR
   npm start    # Production
   ```

## 📧 Gmail Setup (IMPORTANT)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Create App Password
1. In Google Account Security, find "App passwords"
2. Select "Mail" as the app
3. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
4. Remove spaces and use in your .env file

### Step 3: Update .env File
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
FROM_NAME=Optimizi
PORT=4001
ALLOW_SELF_SIGNED=true
```

## 🧪 Testing

### Test Email Configuration
```bash
node test-email.js
```
This will:
- Check environment variables
- Verify Gmail connection
- Send a test email to yourself

### Test API Endpoints
```bash
# Health check
curl http://localhost:4001/health

# Test email endpoint
curl -X POST http://localhost:4001/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

## 🔧 Troubleshooting

### Common Issues

**1. "Invalid login" error**
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2FA is enabled on your Gmail account
- Try generating a new App Password

**2. "Connection timeout" error**
- Check your internet connection
- Verify firewall settings
- Try setting `ALLOW_SELF_SIGNED=true` in .env

**3. "Authentication failed" error**
- Double-check your Gmail address in GMAIL_USER
- Verify the App Password is correct (16 characters, no spaces)
- Make sure the Gmail account has 2FA enabled

**4. Emails not being received**
- Check spam/junk folders
- Verify the recipient email address is correct
- Check Gmail's "Sent" folder to confirm emails were sent

### Debug Mode

If `GMAIL_USER` or `GMAIL_APP_PASSWORD` are not set, the server runs in debug mode:
- Emails are logged to console instead of being sent
- Useful for development and testing
- No actual emails are delivered

## 📊 Monitoring

### Health Check
Visit `http://localhost:4001/health` to check:
- Server status
- Email service configuration
- Environment variables status

### Logs
The server provides detailed logging:
- ✅ Success messages (green)
- ❌ Error messages (red)
- ⚠️ Warning messages (yellow)
- 📧 Email activity
- 🔧 Configuration status

Setup (local):

## 🔐 Security Notes

- **Never commit your .env file** to version control
- **Use App Passwords** instead of regular Gmail passwords
- **Enable 2FA** on your Gmail account for security
- **Rotate App Passwords** regularly for security

## 🚀 Production Deployment

For production deployment, consider:
- Using environment variables instead of .env files
- Adding rate limiting middleware
- Implementing request authentication
- Adding input validation and sanitization
- Setting up error tracking (e.g., Sentry)
- Using a dedicated email service (SendGrid, Mailgun, etc.)

## 📞 Support

If you're still having issues:
1. Run `node test-email.js` to diagnose the problem
2. Check the server logs for detailed error messages
3. Verify your Gmail App Password is correct
4. Ensure 2FA is enabled on your Gmail account
