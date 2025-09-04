require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 4001;

// Enhanced logging
console.log('🚀 Starting Optimizi Email Server...');
console.log('📧 Environment check:');
console.log('  - GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('  - GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('  - FROM_NAME:', process.env.FROM_NAME || 'Optimizi (default)');
console.log('  - PORT:', PORT);
console.log('  - ALLOW_SELF_SIGNED:', process.env.ALLOW_SELF_SIGNED || 'false');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');

// Create transporter using Gmail SMTP when credentials are provided.
// Otherwise fall back to a debug JSON transport that logs the message.
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Allow disabling TLS verification in development or when explicitly requested
const tlsOptions = {};
if (process.env.ALLOW_SELF_SIGNED === 'true' || process.env.NODE_ENV !== 'production') {
  tlsOptions.rejectUnauthorized = false;
}

let transporter;
let usingRealTransport = false;
if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  console.log('📧 Configuring Gmail SMTP transporter...');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    tls: tlsOptions
  });
  usingRealTransport = true;
  
  // Verify transporter configuration
  transporter.verify().then(() => {
    console.log('✅ Gmail SMTP transporter verified and ready');
  }).catch(err => {
    console.error('❌ Gmail SMTP verification failed:', err && err.message ? err.message : err);
    console.error('💡 Check your Gmail credentials and App Password');
    console.error('💡 Make sure 2FA is enabled and you\'re using an App Password');
    console.error('💡 App Password format: 16 characters without spaces');
  });
} else {
  console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set. Using debug JSON transport (emails will be logged, not sent).');
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    emailService: usingRealTransport ? 'gmail' : 'debug',
    timestamp: new Date().toISOString(),
    environment: {
      hasGmailUser: !!GMAIL_USER,
      hasGmailPassword: !!GMAIL_APP_PASSWORD,
      fromName: process.env.FROM_NAME || 'Optimizi'
    }
  });
});

app.post('/send-supplier-email', async (req, res) => {
  try {
    console.log('📧 [Supplier Email] Received request:', {
      to: req.body.to_email,
      subject: req.body.subject,
      hasMessage: !!req.body.message,
      timestamp: new Date().toISOString()
    });

    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) {
      console.error('❌ [Supplier Email] Missing required fields:', { to_email: !!to_email, subject: !!subject, message: !!message });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to_email)) {
      console.error('❌ [Supplier Email] Invalid email format:', to_email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">Optimizi - Notification Fournisseur</h1>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${message}</pre>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>© 2025 Optimizi. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    console.log('📧 [Supplier Email] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      usingRealTransport
    });

    const info = await transporter.sendMail(mailOptions);
    
    if (usingRealTransport) {
      console.log('✅ [Supplier Email] Email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      // Log additional details for debugging
      if (info.rejected && info.rejected.length > 0) {
        console.warn('⚠️ [Supplier Email] Some recipients were rejected:', info.rejected);
      }
    } else {
      console.log('📝 [Supplier Email] Debug mode - Email logged:', info.message);
    }
    
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('❌ [Supplier Email] Error:', error);
    
    // Enhanced error logging
    if (error.code) {
      console.error('❌ [Supplier Email] Error code:', error.code);
    }
    if (error.response) {
      console.error('❌ [Supplier Email] SMTP response:', error.response);
    }
    
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// Generic send-email endpoint (used by client and supplier frontends)
app.post('/send-email', async (req, res) => {
  try {
    console.log('📧 [Generic Email] Received request:', {
      to: req.body.to_email,
      subject: req.body.subject,
      hasMessage: !!req.body.message,
      timestamp: new Date().toISOString()
    });

    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) {
      console.error('❌ [Generic Email] Missing required fields:', { to_email: !!to_email, subject: !!subject, message: !!message });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to_email)) {
      console.error('❌ [Generic Email] Invalid email format:', to_email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">Optimizi - Notification</h1>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${message}</pre>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>© 2025 Optimizi. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    console.log('📧 [Generic Email] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      usingRealTransport
    });

    const info = await transporter.sendMail(mailOptions);
    
    if (usingRealTransport) {
      console.log('✅ [Generic Email] Email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      if (info.rejected && info.rejected.length > 0) {
        console.warn('⚠️ [Generic Email] Some recipients were rejected:', info.rejected);
      }
    } else {
      console.log('📝 [Generic Email] Debug mode - Email logged:', info.message);
    }
    
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('❌ [Generic Email] Error:', error);
    
    if (error.code) {
      console.error('❌ [Generic Email] Error code:', error.code);
    }
    if (error.response) {
      console.error('❌ [Generic Email] SMTP response:', error.response);
    }
    
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/send-test-email', async (req, res) => {
  try {
    console.log('📧 [Test Email] Received request:', {
      to: req.body.to_email,
      subject: req.body.subject,
      timestamp: new Date().toISOString()
    });

    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) {
      console.error('❌ [Test Email] Missing required fields');
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to_email)) {
      console.error('❌ [Test Email] Invalid email format:', to_email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">🧪 Test Email</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; text-align: center;">Optimizi Email Service</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${message}</pre>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>© 2025 Optimizi. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    console.log('📧 [Test Email] Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    if (usingRealTransport) {
      console.log('✅ [Test Email] Test email sent successfully:', {
        messageId: info.messageId,
        to: to_email
      });
      
      if (info.rejected && info.rejected.length > 0) {
        console.warn('⚠️ [Test Email] Some recipients were rejected:', info.rejected);
      }
    } else {
      console.log('📝 [Test Email] Debug mode - Test email logged:', info.message);
    }
    
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('❌ [Test Email] Error:', error);
    
    if (error.code) {
      console.error('❌ [Test Email] Error code:', error.code);
    }
    if (error.response) {
      console.error('❌ [Test Email] SMTP response:', error.response);
    }
    
    return res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Add error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ [Server] Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Optimizi Email Server running on port ${PORT}`);
  console.log(`📧 Email service: ${usingRealTransport ? 'Gmail SMTP (Production)' : 'Debug Mode (Development)'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (!usingRealTransport) {
    console.log('');
    console.log('⚠️  IMPORTANT: Email service is in DEBUG MODE');
    console.log('   Emails will be logged to console but NOT actually sent');
    console.log('   To enable real email sending:');
    console.log('   1. Set GMAIL_USER in your .env file');
    console.log('   2. Set GMAIL_APP_PASSWORD in your .env file');
    console.log('   3. Restart the server');
    console.log('');
  } else {
    console.log('');
    console.log('✅ Email service is ACTIVE and ready to send emails');
    console.log('📧 Emails will be sent from:', process.env.GMAIL_USER);
    console.log('');
  }
});
