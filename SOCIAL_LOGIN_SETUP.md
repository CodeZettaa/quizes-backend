# Social Login Setup Guide

This guide explains how to set up Google and LinkedIn OAuth for the QuizHub platform.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback

# Frontend Redirects
FRONTEND_SUCCESS_REDIRECT=http://localhost:8888/auth/social/callback
FRONTEND_FAILURE_REDIRECT=http://localhost:8888/auth/login
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure:
   - **Name**: QuizHub (or your app name)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** to your `.env` file

### 2. Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Google+ API** (if not already enabled)
   - **People API** (recommended for better profile data)

## LinkedIn OAuth Setup

### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create app**
3. Fill in the app details:
   - **App name**: QuizHub (or your app name)
   - **LinkedIn Page**: Select or create a LinkedIn page
   - **Privacy policy URL**: Your privacy policy URL
   - **App logo**: Upload your app logo
4. Click **Create app**

### 2. Configure OAuth Settings

1. In your LinkedIn app, go to **Auth** tab
2. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/linkedin/callback` (development)
   - `https://yourdomain.com/auth/linkedin/callback` (production)
3. Under **Products**, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (required)
   - **Email address** (optional but recommended)
4. Copy the **Client ID** and **Client Secret** to your `.env` file

### 3. Request Required Permissions

LinkedIn requires approval for certain permissions. Make sure to:
- Request access to `openid`, `profile`, and `email` scopes
- Complete the app verification process if required

## API Endpoints

### Google OAuth

- **Initiate Login**: `GET /auth/google`
  - Redirects user to Google consent screen
- **Callback**: `GET /auth/google/callback`
  - Handles Google OAuth callback
  - Redirects to frontend with token

### LinkedIn OAuth

- **Initiate Login**: `GET /auth/linkedin`
  - Redirects user to LinkedIn consent screen
- **Callback**: `GET /auth/linkedin/callback`
  - Handles LinkedIn OAuth callback
  - Redirects to frontend with token

## Frontend Integration

### Success Response

After successful authentication, users are redirected to:
```
FRONTEND_SUCCESS_REDIRECT?token=<JWT_TOKEN>&newUser=<true|false>
```

Example:
```
http://localhost:8888/auth/social/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&newUser=false
```

### Error Response

On failure, users are redirected to:
```
FRONTEND_FAILURE_REDIRECT?error=social_login_failed
```

Example:
```
http://localhost:8888/auth/login?error=social_login_failed
```

### Frontend Implementation

```typescript
// Handle social login callback
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const newUser = urlParams.get('newUser') === 'true';
const error = urlParams.get('error');

if (error) {
  // Handle error
  console.error('Social login failed:', error);
} else if (token) {
  // Store token and redirect
  localStorage.setItem('accessToken', token);
  if (newUser) {
    // Show welcome message for new users
  }
  // Redirect to dashboard
  router.navigate('/dashboard');
}
```

## Security Notes

1. **State Parameter**: The implementation uses Passport's built-in state handling for CSRF protection
2. **Redirect URLs**: Only whitelisted redirect URLs from environment variables are used
3. **Token Security**: Provider tokens are never sent to the frontend - only our own JWT tokens
4. **Email Uniqueness**: Email is optional for social-only users (sparse unique index)

## Database Schema

### SocialAccount Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  provider: 'google' | 'linkedin',
  providerUserId: string, // OIDC "sub"
  email: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Unique compound index on `(provider, providerUserId)`
- Index on `userId`

### User Collection Updates

- `email`: Now optional (can be `null` for social-only users)
- `password`: Can be `null` for social-only users
- `avatarUrl`: Already exists, populated from social providers

## Testing

1. Start the backend server:
   ```bash
   npm run start:dev
   ```

2. Test Google OAuth:
   - Navigate to `http://localhost:3000/auth/google`
   - Complete Google authentication
   - Verify redirect to frontend with token

3. Test LinkedIn OAuth:
   - Navigate to `http://localhost:3000/auth/linkedin`
   - Complete LinkedIn authentication
   - Verify redirect to frontend with token

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure callback URLs in provider settings match exactly
   - Check for trailing slashes or protocol mismatches

2. **"Invalid client"**
   - Verify Client ID and Client Secret are correct
   - Check that credentials are for the correct environment

3. **"Access denied"**
   - Ensure required scopes are requested
   - Check that app is approved (for LinkedIn)

4. **"Email not available"**
   - Some users may not grant email permission
   - System handles null emails gracefully

## Production Deployment

1. Update all URLs to use production domains
2. Ensure HTTPS is enabled
3. Update redirect URLs in provider settings
4. Use secure environment variable storage
5. Enable CORS for your frontend domain
6. Monitor logs for authentication failures

