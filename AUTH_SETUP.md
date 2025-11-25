# Production-Ready Authentication System - Setup Guide

This guide explains how to set up and use the production-ready authentication system for Deep Focus Planner.

## Features Implemented

✅ **Multiple Authentication Methods**
- Email + Password
- Username + Password (optional)
- Google OAuth
- Apple ID (infrastructure ready, requires configuration)

✅ **Email Flows**
- Email verification for new signups
- Password reset via email
- Beautiful HTML email templates

✅ **Security**
- Secure password hashing (bcrypt)
- JWT token-based authentication
- Cryptographically secure verification tokens
- Token expiry enforcement
- SQL injection protection (Pydantic validation)

✅ **User Experience**
- Beautiful, modern UI for all auth pages
- Real-time form validation
- Password strength indicators
- Loading states and error messages
- Smooth redirects and success states

## Setup Instructions

### 1. Backend Dependencies

Install the new dependencies:

```bash
cd backend
pip install -r requirements.txt
```

New packages install:
- `sendgrid` - for email sending (or use SMTP)
- `aiosmtplib` - for SMTP email support
- `authlib` - for OAuth integration

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

#### Email Configuration (Choose One)

**Option A: SendGrid (Recommended for Production)**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@deepfocusplanner.com
EMAIL_FROM_NAME=Deep Focus Planner
```

To get a SendGrid API key:
1. Sign up at [SendGrid](https://signup.sendgrid.com/)
2. Create an API key in Settings → API Keys
3. Verify your sender email

**Option B: SMTP (Gmail or Custom)**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Not your regular password!
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Deep Focus Planner
```

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password in Google Account settings
3. Use the app password, not your regular password

#### OAuth Configuration (Optional)

See [SETUP_OAUTH.md](./SETUP_OAUTH.md) for detailed OAuth setup instructions.

**Google OAuth:**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Frontend URL:**
```env
FRONTEND_URL=http://localhost:3000  # Change for production
```

### 3. Database Migration

The User model has been extended with new fields. You have two options:

**Option A: Reset Database (Development Only)**

If you're in development and can afford to lose data:

```bash
cd backend
rm planner.db  # Delete the old database
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

**Option B: Create Migration (Recommended)**

```bash
cd backend
# Create a new migration
alembic revision --autogenerate -m "Add auth fields to user model"

# Review the generated migration in alembic/versions/

# Apply the migration
alembic upgrade head
```

### 4. Frontend Environment

Create or update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Test the Setup

**Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000/signup` and test the signup flow.

## Testing Email Flows (Development)

While developing, you may not have real email configured. Here's how to test:

### Without Real Email Service

1. Check backend logs for the verification/reset links
2. The links will be printed to console when emails "send"
3. Manually copy the token from logs and navigate to the verification/reset URLs

### With Real Email (Recommended)

1. Configure SendGrid or SMTP as described above
2. Use your real email for testing
3. Check your inbox for verification/reset emails

## Usage

### User Registration Flow

1. User visits `/signup`
2. Fills out the form (email, password, optional username)
3. Submits the form
4. User account is created in database
5. Verification email is sent
6. User clicks link in email
7. Email is verified
8. User can now log in

### Password Reset Flow

1. User clicks "Forgot password?" on login page
2. Enters their email
3. Receives password reset email
4. Clicks link in email
5. Enters new password
6. Password is reset
7. User can log in with new password

### OAuth Flow (Google/Apple)

1. User clicks "Continue with Google/Apple"
2. Redirected to OAuth provider
3. User authorizes the application
4. Redirected back to app with auth token
5. User account created or logged in
6. Redirected to dashboard

## API Endpoints

All auth endpoints are under `/api/v1/auth/`:

- `POST /signup` - Register new user
- `POST /login` - Login with email/username
- `GET /me` - Get current user
- `POST /verify-email` - Verify email with token
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /apple` - Initiate Apple OAuth (requires setup)
- `GET /apple/callback` - Apple OAuth callback (requires setup)

## Security Best Practices

✅ **Implemented:**
- Passwords hashed with bcrypt
- JWT tokens with expiry
- Secure random tokens for email verification
- SQL injection protection via Pydantic
- CORS configuration

🔒 **For Production:**
- [ ] Use HTTPS (required for OAuth)
- [ ] Set strong `SECRET_KEY` in .env
- [ ] Configure rate limiting (recommended)
- [ ] Enable CSRF protection
- [ ] Regular security audits
- [ ] Rotate OAuth secrets regularly

## Troubleshooting

### Emails Not Sending

1. Check `EMAIL_PROVIDER` is set correctly
2. Verify API keys/SMTP credentials
3. Check backend logs for error messages
4. For Gmail: ensure app password is used, not regular password

### OAuth Not Working

1. Verify callback URLs are registered in OAuth provider
2. Check `FRONTEND_URL` matches your actual frontend URL
3. Ensure HTTPS is enabled in production
4. See [SETUP_OAUTH.md](./SETUP_OAUTH.md) for detailed setup

### Database Errors

1. Ensure migration has been run
2. Check database file permissions
3. For SQLite: ensure write permissions to parent directory

### Type Errors in Frontend

1. Run `npm install` to ensure all dependencies are installed
2. Restart the TypeScript server in your IDE
3. Clear `.next` cache: `rm -rf .next`

## Next Steps

1. configure email service credentials
2. (Optional) Set up Google OAuth credentials  
3. Run database migration
4. Test all auth flows
5. Deploy to production with HTTPS

For questions or issues, check the implementation plan or backend/frontend code comments.
