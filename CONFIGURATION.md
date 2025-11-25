# Deep Focus Planner - Configuration Guide

Complete configuration guide for setting up the Deep Focus Planner application in development, staging, and production environments.

## Quick Start

### For Development

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and set your values
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local
   npm install
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## Configuration Overview

The application requires configuration for:

| Component | Configuration File | Documentation |
|-----------|-------------------|---------------|
| Backend Environment | `backend/.env` | [.env.example](backend/.env.example) |
| Frontend Environment | `frontend/.env.local` | [.env.local.example](frontend/.env.local.example) |
| Email Service | Backend `.env` | [EMAIL_SETUP.md](EMAIL_SETUP.md) |
| OAuth (Google/Apple) | Backend `.env` | [SETUP_OAUTH.md](SETUP_OAUTH.md) |

---

## Environment Variables

### Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | JWT signing key (generate new!) | Run: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

#### Email Configuration

Choose **one** email provider:

**Option 1: SendGrid (Recommended for Production)**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Deep Focus Planner
```

**Option 2: SMTP (Good for Development)**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Deep Focus Planner
```

📖 **Detailed Setup**: See [EMAIL_SETUP.md](EMAIL_SETUP.md)

#### OAuth Configuration (Optional)

**Google OAuth**:
```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

**Apple OAuth**:
```env
APPLE_CLIENT_ID=com.yourdomain.app
APPLE_TEAM_ID=XXXXX12345
APPLE_KEY_ID=YYYYY67890
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

📖 **Detailed Setup**: See [SETUP_OAUTH.md](SETUP_OAUTH.md)

#### Security & CORS

```env
ALLOWED_ORIGINS_STR=http://localhost:3000,http://localhost:3001
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
```

### Frontend Environment Variables

Copy `frontend/.env.local.example` to `frontend/.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Frontend public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

---

## Frontend Redirect URLs

The application uses these routes for authentication flows:

| Route | Purpose | Configured In |
|-------|---------|---------------|
| `/auth/google/callback` | Google OAuth callback | Google Cloud Console |
| `/auth/apple/callback` | Apple OAuth callback | Apple Developer Portal |
| `/auth/oauth-success` | OAuth success handler | Backend OAuth flow |
| `/verify-email` | Email verification | Backend email service |
| `/reset-password` | Password reset | Backend email service |
| `/forgot-password` | Forgot password form | User-initiated |
| `/login` | Login page | OAuth error fallback |

### Configuring OAuth Redirect URLs

When setting up OAuth providers, use these redirect URIs based on your environment:

**Development**:
- Google: `http://localhost:3000/auth/google/callback`
- Apple: Not supported (use staging or tunneling service)

**Staging**:
- Google: `https://staging.yourdomain.com/auth/google/callback`
- Apple: `https://staging.yourdomain.com/auth/apple/callback`

**Production**:
- Google: `https://yourdomain.com/auth/google/callback`
- Apple: `https://yourdomain.com/auth/apple/callback`

---

## Deployment Scenarios

### Development (Local Machine)

**Database**: SQLite (default) or local PostgreSQL
```env
DATABASE_URL=sqlite:///./planner.db
# OR
DATABASE_URL=postgresql://planner_user:planner_password@localhost:5432/planner_db
```

**Email**: SMTP with Gmail or test email service
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
```

**OAuth**: Test with Google OAuth (Apple requires HTTPS)

**URLs**:
```env
# Backend .env
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS_STR=http://localhost:3000

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging Environment

**Database**: Managed PostgreSQL (Railway, Supabase, AWS RDS, etc.)
```env
DATABASE_URL=postgresql://user:password@staging-db.example.com:5432/planner_staging
```

**Email**: SendGrid with domain verification
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-staging-key
EMAIL_FROM=noreply@staging.yourdomain.com
```

**OAuth**: Staging redirect URLs configured
```env
FRONTEND_URL=https://staging.yourdomain.com
```

**URLs**:
```env
# Backend .env
FRONTEND_URL=https://staging.yourdomain.com
ALLOWED_ORIGINS_STR=https://staging.yourdomain.com

# Frontend .env.local
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
```

### Production Environment

**Database**: Managed PostgreSQL with SSL
```env
DATABASE_URL=postgresql://prod_user:secure_password@prod-db.example.com:5432/planner_prod?sslmode=require
```

**Email**: SendGrid with full domain authentication
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-production-key
EMAIL_FROM=noreply@yourdomain.com
```

**OAuth**: Production redirect URLs
```env
FRONTEND_URL=https://yourdomain.com
```

**Security**: Strong secret keys and limited CORS
```env
SECRET_KEY=<64-character-hex-generated-securely>
ALLOWED_ORIGINS_STR=https://yourdomain.com,https://www.yourdomain.com
ENVIRONMENT=production
```

---

## Production Checklist

Before deploying to production, ensure:

### Security
- [ ] Generate a new `SECRET_KEY` (do NOT use default/example)
- [ ] Change all default passwords
- [ ] Enable HTTPS for all endpoints
- [ ] Restrict `ALLOWED_ORIGINS_STR` to production domains only
- [ ] Use environment variables (not hardcoded secrets)
- [ ] Set up database SSL connections

### Email Service
- [ ] Choose email provider (SendGrid recommended)
- [ ] Set up sender authentication/verification
- [ ] Configure domain authentication (SPF, DKIM, DMARC)
- [ ] Test email delivery in production
- [ ] Set `EMAIL_FROM` to professional domain email

### OAuth (if using)
- [ ] Configure production redirect URIs in OAuth providers
- [ ] Use production credentials (not development)
- [ ] Verify OAuth consent screens are complete
- [ ] Test OAuth flows in production

### Database
- [ ] Use managed PostgreSQL (not SQLite)
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Enable SSL connections

### Frontend & Backend
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Update `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Verify CORS settings allow production frontend
- [ ] Test all authentication flows
- [ ] Set up monitoring and error tracking

### DNS & Domains
- [ ] Configure custom domain for frontend
- [ ] Configure custom domain/subdomain for backend API
- [ ] Set up SSL certificates (Let's Encrypt, Cloudflare, etc.)
- [ ] Configure DNS records for email (SPF, DKIM, DMARC)

---

## Troubleshooting

### Common Issues

**Problem**: "Connection refused" when frontend calls backend
- **Check**: `NEXT_PUBLIC_API_URL` in frontend matches backend URL
- **Check**: Backend server is running
- **Check**: CORS is configured to allow frontend origin

**Problem**: OAuth redirect mismatch errors
- **Check**: `FRONTEND_URL` in backend `.env` is correct
- **Check**: Exact redirect URI is added in OAuth provider console
- **Check**: Using `http://localhost:3000` not `http://127.0.0.1:3000`

**Problem**: Emails not being sent
- **Check**: Email provider credentials are correct
- **Check**: `EMAIL_PROVIDER` is set correctly (`sendgrid` or `smtp`)
- **Check**: Backend logs for email errors
- **See**: [EMAIL_SETUP.md](EMAIL_SETUP.md) troubleshooting section

**Problem**: Database connection errors
- **Check**: `DATABASE_URL` format is correct
- **Check**: Database server is running and accessible
- **Check**: Credentials are correct
- **Check**: Firewall allows connection to database port

### Getting Help

1. **Check Logs**:
   - Backend: Console output when running `uvicorn`
   - Frontend: Browser console (F12)
   - Check for error messages and stack traces

2. **Verify Configuration**:
   - Use `.env.example` files as reference
   - Ensure no typos in variable names
   - Check for extra spaces or quotes in values

3. **Review Documentation**:
   - [EMAIL_SETUP.md](EMAIL_SETUP.md) - Email configuration
   - [SETUP_OAUTH.md](SETUP_OAUTH.md) - OAuth setup
   - [backend/README.md](backend/README.md) - Backend API docs
   - [START_HERE.md](START_HERE.md) - General project overview

---

## Related Documentation

- **[START_HERE.md](START_HERE.md)** - Project overview and getting started
- **[EMAIL_SETUP.md](EMAIL_SETUP.md)** - Email service configuration (SendGrid & SMTP)
- **[SETUP_OAUTH.md](SETUP_OAUTH.md)** - OAuth authentication setup (Google & Apple)
- **[AUTH_SETUP.md](AUTH_SETUP.md)** - Authentication system overview
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[backend/.env.example](backend/.env.example)** - Backend environment variables reference
- **[frontend/.env.local.example](frontend/.env.local.example)** - Frontend environment variables reference

---

## Environment Variables Quick Reference

### Backend Required Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=<generate-with-python-secrets>
FRONTEND_URL=http://localhost:3000
EMAIL_PROVIDER=sendgrid  # or smtp
```

### Backend Email Variables (SendGrid)
```env
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Deep Focus Planner
```

### Backend Email Variables (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Backend OAuth Variables (Optional)
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=com.yourdomain.app
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### Frontend Required Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

**Last Updated**: 2025-11-25  
**Version**: 1.0
