require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
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
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    tls: tlsOptions
  });
  usingRealTransport = true;
  transporter.verify().then(() => {
    console.log('✅ Gmail SMTP transporter verified and ready');
  }).catch(err => {
    console.error('❌ Gmail SMTP verification failed:', err && err.message ? err.message : err);
    console.error('💡 Check your Gmail credentials and App Password');
  });
} else {
  console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set. Using debug JSON transport (emails will be logged, not sent).');
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

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

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `<pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>`
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
    } else {
      console.log('📝 [Supplier Email] Debug mode - Email logged:', info.message);
    }
    
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('❌ [Supplier Email] Error:', error);
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

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `<pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>`
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
    } else {
      console.log('📝 [Generic Email] Debug mode - Email logged:', info.message);
    }
    
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('❌ [Generic Email] Error:', error);
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

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `<pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>`
    };

    console.log('📧 [Test Email] Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    if (usingRealTransport) {
      console.log('✅ [Test Email] Test email sent successfully:', {
        messageId: info.messageId,
        to: to_email
      });
    } else {
      console.log('📝 [Test Email] Debug mode - Test email logged:', info.message);
    }
    
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('❌ [Test Email] Error:', error);
    return res.status(500).json({ error: 'Failed to send test email' });
  }
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
  }
});
