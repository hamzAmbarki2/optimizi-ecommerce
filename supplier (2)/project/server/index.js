require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 4001;

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
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    tls: tlsOptions
  });
  usingRealTransport = true;
  transporter.verify().then(() => {
    console.log('Nodemailer transporter ready (Gmail)');
  }).catch(err => {
    console.warn('Nodemailer verification failed:', err && err.message ? err.message : err);
  });
} else {
  console.warn('GMAIL_USER or GMAIL_APP_PASSWORD not set. Using debug JSON transport (emails will be logged, not sent).');
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

app.post('/send-supplier-email', async (req, res) => {
  try {
    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `<pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>`
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('send-supplier-email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// Generic send-email endpoint (used by client and supplier frontends)
app.post('/send-email', async (req, res) => {
  try {
    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) return res.status(400).json({ error: 'Missing required fields' });

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `<pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>`
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('send-email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/send-test-email', async (req, res) => {
  try {
    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) return res.status(400).json({ error: 'Missing fields' });

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject,
      text: message,
      html: `<pre style="white-space:pre-wrap;font-family:inherit">${message}</pre>`
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ ok: true, info });
  } catch (error) {
    console.error('send-test-email error:', error);
    return res.status(500).json({ error: 'Failed to send test email' });
  }
});

app.listen(PORT, () => {
  console.log(`Supplier email backend listening on port ${PORT}`);
});
