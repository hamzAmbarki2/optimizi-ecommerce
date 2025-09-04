# Mailing Feature Setup Instructions

This document provides step-by-step instructions for setting up the mailing feature in your Optimizi e-commerce application.

## Overview

The mailing feature includes:
1. **Automated order status notifications** - Emails sent when order status changes
2. **Contact form emails** - Messages from the contact page sent to your support team
3. **Future promotional emails** - Framework for sending featured product promotions

## Required Setup Steps

### 1. EmailJS Account Setup (FREE)

EmailJS is a free service that allows sending emails directly from the frontend without a backend server.

#### Step 1.1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

#### Step 1.2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the setup instructions for your chosen provider
5. **Important**: Note down your **Service ID** (you'll need this later)

#### Step 1.3: Create Email Templates

You need to create 2 email templates:

**Template 1: Order Notifications**
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```
Subject: {{subject}}

Dear {{to_name}},

{{message}}

Order Details:
- Order ID: {{order_id}}
- Status: {{status}}

Best regards,
{{company_name}} Team

---
This is an automated message. Please do not reply to this email.
```

4. Save the template and note the **Template ID**

**Template 2: Contact Form**
1. Create another new template
2. Use this template content:

```
Subject: New Contact Form Message - {{subject}}

You have received a new message from your website contact form.

From: {{from_name}} ({{from_email}})
Subject: {{subject}}

Message:
{{message}}

---
Sent via {{company_name}} Contact Form
```

3. Save the template and note the **Template ID**

#### Step 1.4: Get Your Public Key
1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (also called User ID)
3. Note this down

### 2. Environment Variables Setup

#### Step 2.1: Create .env File
1. In your project root, create a file named `.env`
2. Copy the content from `.env.example`
3. Replace the placeholder values with your actual EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_actual_service_id
VITE_EMAILJS_ORDER_TEMPLATE_ID=your_order_template_id
VITE_EMAILJS_CONTACT_TEMPLATE_ID=your_contact_template_id
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

#### Step 2.2: Update Support Email
In `src/services/emailService.ts`, find this line:
```typescript
to_email: 'huwuwhuwu9@gmail.com', // TODO: Replace with your actual support email
```

Replace `support@optimizi.com` with your actual support email address.

### 3. Testing the Setup

#### Step 3.1: Test Contact Form
1. Start your development server: `npm run dev`
2. Navigate to the Contact page
3. Fill out and submit the contact form
4. Check your support email inbox for the message

#### Step 3.2: Test Order Notifications
1. Place a test order in your application
2. Check the email address used for the order
3. You should receive emails as the order status changes:
   - Immediately: "Order pending" email
   - After 2 seconds: "Order confirmed" email

### 4. Customization Options

#### Step 4.1: Email Templates
You can customize the email templates in EmailJS dashboard:
- Add your company logo
- Change colors and styling
- Modify the message content
- Add additional variables

#### Step 4.2: Email Content
To modify email content, edit the templates in `src/services/emailService.ts`:
- `ORDER_STATUS_TEMPLATES` object contains all order status email content
- You can change subjects, messages, and add new status types

#### Step 4.3: Promotional Emails (Future)
The framework for promotional emails is already in place. To implement:
1. Create a new template in EmailJS for promotions
2. Implement the `sendPromotionalEmail` method in `emailService.ts`
3. Create a scheduled function or admin interface to trigger promotional emails

## Troubleshooting

### Common Issues

1. **"EmailJS not configured" warning**
   - Check that all environment variables are set correctly
   - Ensure `.env` file is in the project root
   - Restart your development server after adding environment variables

2. **Emails not sending**
   - Verify your EmailJS service is properly connected to your email provider
   - Check the browser console for error messages
   - Ensure your email provider allows third-party applications (Gmail may require app passwords)

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

**Custom SMTP:**
- EmailJS supports custom SMTP servers
- Requires additional configuration in EmailJS dashboard

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **API Keys**: EmailJS public keys are safe to use in frontend code
3. **Rate Limiting**: EmailJS has rate limits on free accounts (200 emails/month)
4. **Spam Prevention**: EmailJS includes built-in spam protection

## Monitoring and Analytics

EmailJS provides:
- Email delivery status
- Open rates (if enabled)
- Click tracking (if enabled)
- Usage statistics

Access these in your EmailJS dashboard under "Statistics".

## Upgrading to Paid Plans

If you need more than 200 emails/month:
1. EmailJS offers paid plans starting at $15/month
2. Paid plans include higher limits and additional features
3. No code changes required when upgrading

## Support

If you encounter issues:
1. Check EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. Review browser console for error messages
3. Test email templates directly in EmailJS dashboard
4. Contact EmailJS support for service-specific issues

---

**Note**: This implementation uses EmailJS for simplicity and cost-effectiveness. For high-volume applications, consider migrating to a dedicated email service like SendGrid, Mailgun, or AWS SES.