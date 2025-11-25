# Email Service Setup Guide

This guide explains how to configure email services for the Deep Focus Planner application. The application supports two email providers: **SendGrid** (recommended for production) and **SMTP** (good for development).

## Choosing an Email Provider

### SendGrid (Recommended for Production)
- ✅ Easy to set up and use
- ✅ Reliable delivery with high deliverability rates
- ✅ Built-in email analytics and tracking
- ✅ Free tier: 100 emails/day
- ❌ Requires account signup

### SMTP (Good for Development)
- ✅ Works with any email provider (Gmail, Outlook, custom SMTP)
- ✅ No third-party signup needed if you have an email account
- ✅ Good for local testing
- ❌ Gmail has daily sending limits (500 emails/day)
- ❌ May have deliverability issues without proper SPF/DKIM setup

---

## SendGrid Setup

### 1. Create a SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/) and sign up for a free account
2. Verify your email address
3. Complete the sender verification process

### 2. Verify Your Sender Identity

SendGrid requires sender verification to send emails:

**Option A: Single Sender Verification (Easiest for testing)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details (use a real email address you control)
4. Check your email and click the verification link

**Option B: Domain Authentication (Recommended for production)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. Add the provided DNS records to your domain registrar
5. Wait for verification (can take up to 48 hours)

### 3. Create an API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it (e.g., "Deep Focus Planner Production")
4. Choose **Restricted Access** and enable:
   - **Mail Send** → **Full Access**
5. Click **Create & View**
6. **IMPORTANT**: Copy the API key immediately - you won't be able to see it again!

### 4. Configure Your Application

Add to your backend `.env` file:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Deep Focus Planner
```

> **Note**: The `EMAIL_FROM` address must match your verified sender or domain.

### 5. Test Your Configuration

Start your backend server and test the email functionality:

```bash
cd backend
uvicorn app.main:app --reload
```

Try signing up with a new account - you should receive a verification email.

---

## SMTP Setup (Gmail Example)

### 1. Enable 2-Step Verification

1. Go to your [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", enable **2-Step Verification**
3. Follow the setup process

### 2. Generate an App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: "Deep Focus Planner"
5. Click **Generate**
6. **Copy the 16-character password** (remove spaces)

> **Important**: This is NOT your regular Gmail password. It's a special app-specific password.

### 3. Configure Your Application

Add to your backend `.env` file:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Deep Focus Planner
```

### 4. Test Your Configuration

Start your backend server:

```bash
cd backend
uvicorn app.main:app --reload
```

Try signing up with a new account - you should receive a verification email from your Gmail account.

---

## Other SMTP Providers

### Outlook/Hotmail

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-outlook-password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Deep Focus Planner
```

### Yahoo Mail

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
EMAIL_FROM_NAME=Deep Focus Planner
```

> **Note**: Yahoo also requires app-specific passwords. Generate one at [Yahoo Account Security](https://login.yahoo.com/account/security).

### Custom SMTP Server

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Deep Focus Planner
```

---

## Email Templates

The application includes pre-built HTML email templates for:

1. **Email Verification** - Sent when users sign up
2. **Password Reset** - Sent when users request password reset

These templates are defined in `backend/app/core/email.py` and feature:
- Modern, responsive design
- Brand colors (Deep Focus Planner blue gradient)
- Clear call-to-action buttons
- Fallback plain text links

### Customizing Email Templates

To customize the email appearance, edit the HTML in:
- `get_verification_email_html()` - Email verification template
- `get_password_reset_email_html()` - Password reset template

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_PROVIDER` | Email service to use | `sendgrid` or `smtp` |
| `SENDGRID_API_KEY` | SendGrid API key | `SG.xxx...` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | SMTP username | Your email address |
| `SMTP_PASSWORD` | SMTP password | App password or regular password |
| `EMAIL_FROM` | Sender email address | `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME` | Sender display name | `Deep Focus Planner` |
| `EMAIL_VERIFICATION_EXPIRE_HOURS` | Email verification token expiry | `24` (hours) |
| `PASSWORD_RESET_EXPIRE_HOURS` | Password reset token expiry | `1` (hour) |

---

## Troubleshooting

### SendGrid Issues

**Problem**: "Forbidden" or 403 error
- **Solution**: Check that your API key has "Mail Send" permissions and is valid

**Problem**: Emails not being delivered
- **Solution**: Verify your sender identity (single sender or domain authentication)
- Check SendGrid's Activity Feed for delivery status

**Problem**: "The from address does not match a verified Sender Identity"
- **Solution**: Ensure `EMAIL_FROM` matches your verified sender or domain in SendGrid

### SMTP Issues

**Problem**: "Username and Password not accepted" (Gmail)
- **Solution**: 
  1. Enable 2-Step Verification
  2. Use App Password, NOT your regular password
  3. Remove spaces from the 16-character app password

**Problem**: "Connection timeout"
- **Solution**: 
  1. Check firewall settings
  2. Verify SMTP_HOST and SMTP_PORT are correct
  3. Try port 465 instead of 587

**Problem**: "SSL/TLS error"
- **Solution**: Ensure you're using port 587 with STARTTLS (default in the code)

### General Email Issues

**Problem**: Emails go to spam
- **Solution**: 
  1. Set up SPF and DKIM records for your domain
  2. Use a verified domain instead of free email providers
  3. Avoid spammy content and include unsubscribe links

**Problem**: No error but emails not received
- **Solution**:
  1. Check application logs for email sending status
  2. Check spam/junk folder
  3. Verify the recipient email address is correct

---

## Testing Email Locally

For local development testing without actually sending emails, you can use:

### MailHog (Email Testing Tool)

1. Install MailHog: https://github.com/mailhog/MailHog
2. Run MailHog: `mailhog`
3. Configure SMTP to use MailHog:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@deepfocusplanner.com
EMAIL_FROM_NAME=Deep Focus Planner
```

4. View sent emails at: http://localhost:8025

---

## Production Checklist

Before deploying to production:

- [ ] Choose an email provider (SendGrid recommended)
- [ ] Set up sender authentication/verification
- [ ] Generate and securely store API key or SMTP credentials
- [ ] Configure environment variables on your hosting platform
- [ ] Set `EMAIL_FROM` to a professional email address (e.g., `noreply@yourdomain.com`)
- [ ] Test email delivery in production environment
- [ ] Set up domain authentication (SPF, DKIM, DMARC) for better deliverability
- [ ] Monitor email delivery and bounce rates
- [ ] Consider email rate limits for your chosen provider

---

## Related Documentation

- [SETUP_OAUTH.md](SETUP_OAUTH.md) - OAuth authentication setup
- [CONFIGURATION.md](CONFIGURATION.md) - Master configuration guide
- Backend README - API documentation

## Support

If you encounter issues not covered in this guide:
1. Check the backend application logs
2. Review the [SendGrid Documentation](https://docs.sendgrid.com/)
3. Review your email provider's SMTP documentation
