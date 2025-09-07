require('dotenv').config();
const nodemailer = require('nodemailer');

// Test script to verify email configuration
async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  GMAIL_USER:', process.env.GMAIL_USER || '❌ Not set');
  console.log('  GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('  FROM_NAME:', process.env.FROM_NAME || 'Optimizi (default)');
  console.log('');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Missing required environment variables!');
    console.log('');
    console.log('📝 To fix this:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Set your Gmail address in GMAIL_USER');
    console.log('3. Create a Gmail App Password and set it in GMAIL_APP_PASSWORD');
    console.log('4. Run this test again');
    console.log('');
    console.log('🔗 How to create Gmail App Password:');
    console.log('   1. Go to https://myaccount.google.com/security');
    console.log('   2. Enable 2-Factor Authentication');
    console.log('   3. Go to "App passwords" section');
    console.log('   4. Generate a new app password for "Mail"');
    console.log('   5. Use the 16-character password (remove spaces)');
    process.exit(1);
  }

  // Create transporter
  console.log('🔧 Creating Gmail transporter...');
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: process.env.ALLOW_SELF_SIGNED !== 'true'
    }
  });

  // Verify transporter
  console.log('🔍 Verifying transporter...');
  try {
    await transporter.verify();
    console.log('✅ Transporter verified successfully!');
  } catch (error) {
    console.error('❌ Transporter verification failed:', error.message);
    console.log('');
    console.log('💡 Common solutions:');
    console.log('1. Make sure you\'re using a Gmail App Password, not your regular password');
    console.log('2. Enable 2-Factor Authentication on your Gmail account');
    console.log('3. Check that the Gmail address is correct');
    console.log('4. Try generating a new App Password');
    console.log('5. Make sure the App Password has no spaces');
    console.log('6. Check if your Gmail account has "Less secure app access" disabled (it should be)');
    process.exit(1);
  }

  // Send test email
  console.log('📧 Sending test email...');
  const testEmail = {
    from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send to yourself for testing
    subject: '🧪 Test Email from Optimizi Server',
    text: `
Test email sent at: ${new Date().toISOString()}

This is a test email to verify that your Nodemailer configuration is working correctly.

If you received this email, your email service is properly configured!

Configuration details:
- From: ${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>
- Server: Gmail SMTP
- Time: ${new Date().toLocaleString()}

Best regards,
Optimizi Email Service
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">🧪 Test Email</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; text-align: center;">Optimizi Email Service</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #1f2937; margin-top: 0;">Email Configuration Test</h2>
          <p style="color: #4b5563;">This is a test email to verify that your Nodemailer configuration is working correctly.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #374151; margin-top: 0;">Test Details</h3>
            <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
            <p><strong>From:</strong> ${process.env.FROM_NAME || 'Optimizi'} &lt;${process.env.GMAIL_USER}&gt;</p>
            <p><strong>Server:</strong> Gmail SMTP</p>
            <p><strong>Status:</strong> ✅ Configuration Working</p>
          </div>
          
          <p style="color: #059669; font-weight: bold;">✅ If you received this email, your email service is properly configured!</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
          <p>© 2025 Optimizi. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Accepted recipients:', info.accepted);
    if (info.rejected && info.rejected.length > 0) {
      console.log('⚠️ Rejected recipients:', info.rejected);
    }
    console.log('📬 Check your inbox:', process.env.GMAIL_USER);
    console.log('');
    console.log('🎉 Email configuration is working correctly!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    
    if (error.code) {
      console.error('❌ Error code:', error.code);
    }
    if (error.response) {
      console.error('❌ SMTP response:', error.response);
    }
    
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('1. Double-check your Gmail App Password');
    console.log('2. Make sure 2FA is enabled on your Gmail account');
    console.log('3. Try generating a new App Password');
    console.log('4. Check your internet connection');
    console.log('5. Verify the Gmail address is correct');
    console.log('6. Check Gmail\'s "Sent" folder to see if emails are being sent');
    console.log('7. Check spam/junk folders');
  }
}

// Run the test
testEmailConfiguration().catch(console.error);