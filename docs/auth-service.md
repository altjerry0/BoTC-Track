# BotC Tracker Authentication Service

## Overview

The BotC Tracker extension uses a secure hybrid authentication approach that combines Chrome's Identity API with Firebase Authentication. This design ensures compliance with Chrome Web Store policies while maintaining a secure and seamless user experience.

## Architecture

### Components

1. **Chrome Identity API**
   - Handles Google Sign-In without external scripts
   - Provides secure OAuth token acquisition
   - Compliant with Chrome Web Store policies

2. **auth.trackbotc.com Service**
   - Custom authentication service
   - Handles token exchange and validation
   - Manages Firebase custom token generation

3. **Firebase Authentication**
   - Provides secure user authentication
   - Manages user sessions
   - Integrates with Firestore security rules

### Authentication Flow

1. **Initial Sign-In**
   ```
   User -> Chrome Identity API -> Google OAuth Token
   -> auth.trackbotc.com -> Firebase Custom Token
   -> Firebase Auth -> User Session
   ```

2. **Session Management**
   - Chrome Identity API token refresh handled automatically
   - Firebase token refresh managed by Firebase SDK
   - Secure token storage in Chrome extension storage

## Security Features

1. **Token Exchange**
   - OAuth tokens never exposed to the client
   - Server-side validation of Google tokens
   - Short-lived Firebase custom tokens

2. **Data Isolation**
   - Each user has a unique Firebase UID
   - Firestore security rules enforce data separation
   - No cross-user data access possible

3. **Compliance**
   - No external JavaScript loading
   - All authentication flows within Chrome APIs
   - Secure HTTPS communication only

## Implementation Details

### Chrome Extension

```javascript
// Authentication flow in background.js
chrome.identity.getAuthToken({ interactive: true }, async (token) => {
  // Token exchange via auth.trackbotc.com
  const firebaseToken = await exchangeToken(token);
  // Firebase sign-in with custom token
  await firebase.auth().signInWithCustomToken(firebaseToken);
});
```

### Auth Service

- Hosted at auth.trackbotc.com
- Validates Google OAuth tokens
- Generates Firebase custom tokens
- Manages user profile mapping

## Error Handling

1. **Token Exchange Failures**
   - Automatic retry with exponential backoff
   - Clear error messages to users
   - Graceful fallback to anonymous mode

2. **Network Issues**
   - Offline support via cached credentials
   - Automatic reconnection handling
   - Data sync when connection restored

## Best Practices

1. **Security**
   - Always use HTTPS
   - Validate all tokens server-side
   - Never store sensitive tokens in localStorage

2. **User Experience**
   - Silent token refresh when possible
   - Clear error messages
   - Minimal user interaction required

3. **Maintenance**
   - Regular security audits
   - Token rotation policies
   - Monitoring and logging

## Future Improvements

1. **Enhanced Security**
   - Add support for refresh tokens
   - Implement rate limiting
   - Add additional auth providers

2. **User Experience**
   - Improve offline support
   - Add account linking options
   - Enhance error messaging
