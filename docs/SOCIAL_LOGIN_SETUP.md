# Social Login Setup Guide for SkillVerse

## Overview

SkillVerse uses **Clerk** for authentication, which supports multiple social login providers out of the box. This guide explains how to enable social logins for your deployment.

## Supported Social Providers

- **Google** - Most popular, recommended
- **GitHub** - Great for developer-focused platforms
- **Microsoft** - Enterprise users
- **Facebook** - Wide user base
- **Apple** - iOS users
- **LinkedIn** - Professional networking
- **Twitter/X** - Social media users
- **Discord** - Community-focused
- And many more!

## Setup Instructions

### Step 1: Access Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign in with your Clerk account
3. Select your SkillVerse application

### Step 2: Configure Social Connections

1. Navigate to **User & Authentication** → **Social Connections**
2. Click **Add connection** for each provider you want to enable

### Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API** and **People API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set Application type to **Web application**
6. Add Authorized redirect URIs:
   - `https://clerk.YOUR_DOMAIN.com/v1/oauth_callback`
   - Get the exact URL from Clerk dashboard
7. Copy **Client ID** and **Client Secret** to Clerk dashboard

### Step 4: GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - **Application name**: SkillVerse
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: Get from Clerk dashboard
4. Copy **Client ID** and **Client Secret** to Clerk dashboard

### Step 5: Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Add redirect URI from Clerk dashboard
5. Go to **Certificates & secrets** → **New client secret**
6. Copy **Application (client) ID** and **Secret** to Clerk dashboard

## Environment Variables

Make sure these are set in your `.env` files:

```env
# Frontend (.env)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Backend (.env)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Testing Social Logins

1. Start your development server
2. Navigate to `/sign-in` or `/sign-up`
3. You should see social login buttons for enabled providers
4. Click any provider to test the OAuth flow

## Customizing Social Button Appearance

The social buttons are styled in `SignInPage.jsx` and `SignUpPage.jsx` using Clerk's `appearance` prop:

```jsx
appearance={{
  elements: {
    socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
    socialButtonsBlockButtonText: "text-gray-700 font-medium",
  },
}}
```

## Production Checklist

- [ ] Enable production mode in Clerk dashboard
- [ ] Update OAuth redirect URIs to production domain
- [ ] Test all social login flows
- [ ] Configure allowed domains
- [ ] Set up custom domain for Clerk (optional)

## Troubleshooting

### Social buttons not showing
- Check if social connections are enabled in Clerk dashboard
- Verify API keys are correct

### OAuth redirect errors
- Ensure redirect URIs match exactly (including https/http)
- Check for trailing slashes

### User creation issues
- Verify Clerk webhook is set up correctly
- Check backend logs for MongoDB sync issues

## Support

For Clerk-specific issues, visit [Clerk Documentation](https://clerk.com/docs)
