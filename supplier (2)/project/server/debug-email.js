require('dotenv').config();
const nodemailer = require('nodemailer');

// Enhanced debug script with step-by-step testing
async function debugEmailConfiguration() {
  console.log('🔍 COMPREHENSIVE EMAIL DEBUG SCRIPT');
  console.log('=====================================\n');
  
  // Step 1: Environment Variables Check
  console.log('📋 STEP 1: Environment Variables Check');
  console.log('--------------------------------------');
  console.log('GMAIL_USER:', process.env.GMAIL_USER || '❌ NOT SET');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ SET (length: ' + process.env.GMAIL_APP_PASSWORD.length + ')' : '❌ NOT SET');
  console.log('FROM_NAME:', process.env.FROM_NAME || 'Optimizi (default)');
  console.log('ALLOW_SELF_SIGNED:', process.env.ALLOW_SELF_SIGNED || 'false');
  console.log('');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ CRITICAL: Missing Gmail credentials!');
    console.log('');
    console.log('🔧 SETUP INSTRUCTIONS:');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Enable 2-Factor Authentication if not enabled');
    console.log('3. Go to "App passwords" section');
    console.log('4. Generate a new app password for "Mail"');
    console.log('5. Copy the 16-character password (format: abcd efgh ijkl mnop)');
    console.log('6. Remove spaces and add to .env file as GMAIL_APP_PASSWORD');
    console.log('7. Set GMAIL_USER to your Gmail address');
    process.exit(1);
  }

  // Step 2: Gmail App Password Format Check
  console.log('🔐 STEP 2: Gmail App Password Format Check');
  console.log('------------------------------------------');
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (appPassword.includes(' ')) {
    console.warn('⚠️ WARNING: App password contains spaces. Remove all spaces!');
    console.log('Current format:', appPassword);
    console.log('Should be:', appPassword.replace(/\s/g, ''));
  } else if (appPassword.length !== 16) {
    console.warn('⚠️ WARNING: App password should be 16 characters long');
    console.log('Current length:', appPassword.length);
  } else {
    console.log('✅ App password format looks correct');
  }
  console.log('');

  // Step 3: Create and Test Transporter
  console.log('🔧 STEP 3: Creating Gmail Transporter');
  console.log('------------------------------------');
  
  const transporterConfigs = [
    {
      name: 'Standard Gmail Config',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      }
    },
    {
      name: 'Explicit SMTP Config',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    }
  ];

  for (const { name, config } of transporterConfigs) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log('Configuration:', JSON.stringify(config, null, 2));
    
    try {
      const transporter = nodemailer.createTransporter(config);
      
      console.log('🔍 Verifying transporter...');
      await transporter.verify();
      console.log('✅ Verification successful!');
      
      // Step 4: Send Test Email
      console.log('📧 Sending test email...');
      const testEmail = {
        from: `${process.env.FROM_NAME || 'Optimizi'} <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `🧪 Debug Test - ${name} - ${new Date().toLocaleTimeString()}`,
        text: `
Debug Test Email
================

Configuration: ${name}
Sent at: ${new Date().toISOString()}
From: ${process.env.GMAIL_USER}
Test successful: YES

If you received this email, the configuration "${name}" is working correctly!

Next steps:
1. Update your .env file with working configuration
2. Restart your email server
3. Test order notifications through your app

Best regards,
Optimizi Debug Script
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; text-align: center;">🧪 Debug Test Success</h1>
              <p style="color: #d1fae5; margin: 10px 0 0 0; text-align: center;">${name}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981;">
              <h2 style="color: #065f46; margin-top: 0;">✅ Configuration Working!</h2>
              <p style="color: #047857;">This email confirms that your Nodemailer configuration is working correctly.</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #374151; margin-top: 0;">Test Details</h3>
                <p><strong>Configuration:</strong> ${name}</p>
                <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                <p><strong>From:</strong> ${process.env.GMAIL_USER}</p>
                <p><strong>Status:</strong> ✅ SUCCESS</p>
              </div>
              
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <h4 style="color: #065f46; margin-top: 0;">Next Steps:</h4>
                <ol style="color: #047857; margin: 0;">
                  <li>Update your .env file with this working configuration</li>
                  <li>Restart your email server</li>
                  <li>Test order notifications through your app</li>
                  <li>Check both supplier and client email flows</li>
                </ol>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
              <p>© 2025 Optimizi Debug Script. Configuration test successful!</p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Accepted:', info.accepted);
      if (info.rejected && info.rejected.length > 0) {
        console.log('⚠️ Rejected:', info.rejected);
      }
      console.log('📬 Check your inbox:', process.env.GMAIL_USER);
      console.log('');
      console.log('🎉 EMAIL CONFIGURATION IS WORKING!');
      console.log(`✅ Use "${name}" configuration in your server`);
      break; // Stop testing other configs if this one works
      
    } catch (error) {
      console.error(`❌ ${name} failed:`, error.message);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.response) {
        console.error('SMTP response:', error.response);
      }
    }
  }
  
  console.log('\n🔍 FINAL TROUBLESHOOTING CHECKLIST:');
  console.log('===================================');
  console.log('□ Gmail 2FA is enabled');
  console.log('□ App Password is generated and copied correctly');
  console.log('□ App Password has no spaces');
  console.log('□ Gmail address is correct');
  console.log('□ .env file is in the correct directory');
  console.log('□ Server is restarted after .env changes');
  console.log('□ Firewall/antivirus is not blocking SMTP');
  console.log('□ Internet connection is stable');
}

// Run the debug test
debugEmailConfiguration().catch(console.error);