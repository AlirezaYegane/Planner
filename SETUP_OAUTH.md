# Setting Up OAuth Authentication

This guide explains how to configure Google and Apple OAuth for the Deep Focus Planner authentication system.

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select application type: **Web application**
4. Configure the OAuth consent screen if prompted

5. **Add Authorized JavaScript Origins**:
   - Development: `http://localhost:3000`
   - Staging: `https://staging.yourdomain.com`
   - Production: `https://yourdomain.com`

6. **Add Authorized Redirect URIs** (all environments you'll use):
   - Development: `http://localhost:3000/auth/google/callback`
   - Staging: `https://staging.yourdomain.com/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`

> **Important**: You can add multiple redirect URIs for different environments. Make sure to add ALL URLs you'll use!

### 3. Get Your Credentials

1. Copy the **Client ID** and **Client Secret**
2. Add them to your backend `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Apple ID Setup

Apple OAuth requires more configuration due to Apple's requirements.

### 1. Apple Developer Account

You need an active Apple Developer account ($99/year).

### 2. Register an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** and click **Continue**
5. Enter a description and Bundle ID
6. Enable **Sign in with Apple** capability
7. Click **Continue** and **Register**

### 3. Create a Services ID

1. Go to **Identifiers** → **+** button
2. Select **Services IDs** and click **Continue**
3. Enter an identifier and description
4. Enable **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple

6. **Add your domains and redirect URLs**:
   
   **For Development** (requires workaround):
   - Apple doesn't support `localhost` directly
   - You'll need to use a tunneling service (ngrok, localtunnel) or test directly in staging/production
   
   **For Staging**:
   - Domain: `staging.yourdomain.com`
   - Redirect URL: `https://staging.yourdomain.com/auth/apple/callback`
   
   **For Production**:
   - Domain: `yourdomain.com`
   - Redirect URL: `https://yourdomain.com/auth/apple/callback`

7. Save and Register

> **Note**: Apple requires HTTPS for all redirect URLs (except localhost development workarounds).

### 4. Create a Private Key

1. Go to **Keys** → **+** button
2. Enter a key name
3. Enable **Sign in with Apple**
4. Click **Configure** and select your App ID
5. Click **Continue** and **Register**
6. Download the private key file (`.p8`) - you can only download it once!

### 5. Get Your Credentials

You'll need the following for your `.env` file:

```env
APPLE_CLIENT_ID=com.yourdomain.appid
APPLE_TEAM_ID=XXXXXXXXXX  # Found in your Apple Developer account
APPLE_KEY_ID=YYYYYYYYYY  # From the key you just created
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour key content here\n-----END PRIVATE KEY-----
```

> **Note:** The Apple authentication implementation in the codebase is currently a placeholder. Full Apple OAuth implementation requires additional libraries and token handling. Consider using `apple-signin-auth` npm package for Node.js backend integration.

## Testing OAuth Flows

### Development Testing

1. Start your backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start your frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login` or `/signup`
4. Click the OAuth buttons to test the flow

### Google OAuth Test Flow

1. Click "Continue with Google"
2. You'll be redirected to Google's login page
3. Select your Google account
4. Grant permissions
5. You'll be redirected back with an authentication token
6. The app will store the token and redirect to the dashboard

### Production Deployment

When deploying to production:

1. Update redirect URIs in Google Cloud Console to use your production domain
2. Update Apple Services ID with production domain and redirect URL
3. Update `FRONTEND_URL` in your backend `.env` to your production URL
4. Ensure HTTPS is enabled for all OAuth endpoints (required by providers)

## Frontend Redirect URLs

The application uses the following frontend routes for authentication and OAuth callbacks. Make sure these routes exist in your frontend and are configured in your OAuth providers.

### Authentication Routes

| Route | Purpose | Used By |
|-------|---------|----------|
| `/auth/google/callback` | Google OAuth callback | Google OAuth |
| `/auth/apple/callback` | Apple OAuth callback | Apple OAuth |
| `/auth/oauth-success` | Successful OAuth redirect with token | Backend OAuth handlers |
| `/verify-email` | Email verification page | Email verification emails |
| `/reset-password` | Password reset page | Password reset emails |
| `/forgot-password` | Forgot password page | User-initiated password reset |
| `/login` | Login page | OAuth error redirects |

### How OAuth Redirect URLs Work

1. **User clicks "Sign in with Google/Apple"**
2. **User is redirected to OAuth provider** (Google/Apple login page)
3. **User authenticates and grants permissions**
4. **OAuth provider redirects back** to your callback URL:
   - Google: `{FRONTEND_URL}/auth/google/callback`
   - Apple: `{FRONTEND_URL}/auth/apple/callback`
5. **Frontend exchanges code for token** via backend API
6. **User is redirected to** `{FRONTEND_URL}/auth/oauth-success?token=...`

### Environment-Specific Configuration

Make sure your `FRONTEND_URL` in the backend `.env` matches your actual frontend URL:

```env
# Development
FRONTEND_URL=http://localhost:3000

# Staging  
FRONTEND_URL=https://staging.yourdomain.com

# Production
FRONTEND_URL=https://yourdomain.com
```

## Troubleshooting

### Google OAuth Issues

**Error**: `redirect_uri_mismatch` or "Unauthorized redirect_uri"
- **Cause**: The redirect URI doesn't match what's configured in Google Cloud Console
- **Solution**: 
  1. Check your `FRONTEND_URL` in backend `.env`
  2. Verify the exact URL is added in Google Cloud Console
  3. Remember: `http://localhost:3000/auth/google/callback` ≠ `http://127.0.0.1:3000/auth/google/callback`

**Error**: "Invalid client" or "Unauthorized"
- **Cause**: Client ID or Secret is incorrect
- **Solution**: 
  1. Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
  2. Ensure there are no extra spaces or quotes
  3. Verify the credentials are from the correct Google Cloud Project

**Error**: "Access blocked: Authorization Error"
- **Cause**: OAuth consent screen not properly configured
- **Solution**:
  1. Complete the OAuth consent screen configuration
  2. Add test users if app is not published
  3. Add required scopes (email, profile)

### Apple OAuth Issues

**Error**: "invalid_client"
- **Cause**: Services ID doesn't match `APPLE_CLIENT_ID`
- **Solution**: 
  1. Verify your Services ID in Apple Developer Portal
  2. Ensure `APPLE_CLIENT_ID` exactly matches the Services ID
  3. Check that you're using Services ID, not App ID

**Error**: "invalid_request" or token generation fails
- **Cause**: Private key is incorrectly formatted or wrong Key ID
- **Solution**:
  1. Ensure your private key includes the full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
  2. Use `\n` for newlines in the `.env` file (not actual newlines)
  3. Verify `APPLE_KEY_ID` matches the Key ID in Apple Developer Portal
  4. Confirm `APPLE_TEAM_ID` is your 10-character Team ID

**Error**: "invalid_redirect_uri"
- **Cause**: Redirect URI not configured or doesn't use HTTPS
- **Solution**:
  1. Add the exact redirect URI in Apple Services ID configuration
  2. Ensure production URLs use HTTPS (Apple requires it)
  3. For development, use a tunneling service or test in staging

### General OAuth Issues

**Problem**: OAuth callback receives an error parameter
- **Solution**: Check the error description in the URL parameters
- Common errors:
  - `access_denied`: User cancelled the OAuth flow
  - `server_error`: Issue with OAuth provider configuration

**Problem**: Successful OAuth but no token received
- **Solution**:
  1. Check backend logs for errors
  2. Verify backend OAuth endpoints are working
  3. Ensure backend can reach the OAuth provider APIs

**Problem**: CORS errors during OAuth
- **Solution**:
  1. Check `ALLOWED_ORIGINS_STR` in backend `.env` includes your frontend URL
  2. Ensure backend CORS middleware is properly configured
  3. Verify frontend is making requests to the correct backend URL

### Debugging Tips

1. **Check backend logs**: Run backend with `--reload` to see detailed error messages
2. **Inspect browser console**: Look for network errors or failed API calls
3. **Test redirect URIs**: Manually visit the OAuth provider's authorize URL to see the redirect
4. **Verify environment variables**: Print (safely) or log environment variables on startup
5. **Use OAuth provider dashboards**: Check activity logs in Google Cloud Console or Apple Developer Portal

## Security Notes

- Never commit your `.env` file to version control
- Rotate OAuth secrets regularly
- Use HTTPS in production  
- Limit OAuth scopes to only what you need
- Regularly review authorized applications in your OAuth provider consoles
