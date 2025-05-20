# BotC Tracker Firebase Authentication Service

This service provides a secure way for the BotC Tracker Chrome Extension to authenticate with Firebase without loading external scripts, ensuring Chrome Web Store compliance.

## Secure Authentication Flow

![Authentication Flow](https://mermaid.ink/img/pako:eNqVU01v2zAM_SuCTwsc9LCDhxSbC6AokPS0Q-KdRYleCLMyZCkzivz3UbKdpOm6DSiw0CPFj4_iE1pTW2QqU7tD2FJXh5CtQ2zcqVbPtjkRs_1-pYcvRm9xrV8cNPHHQvxr_Ud2PwSRB6upeXHuDUVOokRCyPJl7g4e_L_lN7fSXQA9OLw93RvwI2Ga3uRjDRu-7SjtgfW1-95b4mBpWIVUgL0fXdA47XoXxvSlh8Bvn1dCQcMKp9uv9_cQ27-mzojOcO6mZVBDQKE70I43Hc8sPnK_8TyK_Zz4c83EZzixpLBwvnO-p8FDnRGhYdNrk0uFwcfyD5MXRBKIEkUi5gRJIQ45jF6rjEXRSYqEbGW4iVNlXfipLzs9aIdtuKqF3cElmkSw_c6FY4C6BHZTGJYJcbVU8Ol-uGnF8x4o6xw_a3S5p3VwPkL-n5mtXHj4j3ys2PnXivFQcf8T61Jrk_WW7Q1auPEn5F-m-q9fOLb6tFE3LVHHBwpdIrZ6T6FsUBY1Vq5HobVIE-C0WK7Vei4WUi2KkW8XszBT2Sut7OmAUrE6-oEa-h47Y8Ewf0Cp2AOlWvYXHjXlOKIMfZCfUWrJ2njMtRTRRZYRt81nL7MfyvT0Cw?type=png)

## Overview

This service acts as a middleware between the Chrome Extension and Firebase Authentication. It:

1. Receives Google tokens from the Chrome Extension (obtained via Chrome Identity API)
2. Exchanges them for Firebase custom tokens
3. Returns the tokens to the extension for use with Firestore

This approach eliminates the need for external script loading in the extension while maintaining proper Firebase security.

## Setup Instructions

### Local Development

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create service account key**
   - Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service Accounts
   - Generate a new private key
   - Save it as `service-account-key.json` in the project root (this file is gitignored)

3. **Run the service locally**
   ```
   npm run dev
   ```

### Deployment to Firebase

#### Manual Deployment

1. Install the Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Deploy the service:
   ```
   firebase deploy
   ```

#### Automated Deployment with GitHub Actions

For security reasons, this service should be deployed from a **private repository**. Move this code to a private repository before setting up GitHub Actions.

1. **Required Secrets for GitHub Actions**:

   - `FIREBASE_SERVICE_ACCOUNT`: The JSON content of your Firebase service account key
      - Go to Firebase Console > Project Settings > Service Accounts
      - Click "Generate New Private Key"
      - Copy the entire JSON content
      - Add it as a repository secret in your GitHub repository settings

2. **CI/CD Workflow**:
   - The workflow will deploy to Firebase hosting and functions
   - It will run on pushes to the main branch affecting this directory
   - Manual deployment can be triggered from the Actions tab

## API Endpoints

- **POST `/auth/exchange-token`**
  - Exchanges a Google token for a Firebase custom token
  - Request body: `{ "googleToken": "your-google-token" }`
  - Response: `{ "token": "firebase-custom-token", "user": {user-data} }`

- **GET `/health`**
  - Health check endpoint
  - Response: `{ "status": "ok", "timestamp": "iso-date" }`

## Security Considerations

- Keep the `service-account-key.json` file secure and never commit it to version control
- For production, set up proper CORS configuration to only allow requests from your extension
- Consider implementing rate limiting to prevent abuse
- Add additional validation for the token exchange
- Make sure the Firebase subdomain is properly configured with security headers

## Architecture

```
Chrome Extension                  Auth Service                Firebase
+----------------+              +----------------+          +----------------+
|                |              |                |          |                |
| Chrome         |  Google      | Express Server |          |                |
| Identity API   +------------->+ with Firebase  +--------->+ Firebase Auth  |
|                |   token      | Admin SDK      | Custom   |                |
|                |              |                | token    |                |
+-------+--------+              +----------------+          +-------+--------+
        |                                                           |
        |                                                           |
        v                                                           v
+----------------+                                         +----------------+
|                |                                         |                |
| Extension uses |                                         | Firebase       |
| custom token   +---------------------------------------->+ Firestore      |
| for Firestore  |                                         |                |
|                |                                         |                |
+----------------+                                         +----------------+
```

## Development Notes

- This service must be deployed to the `auth.trackbotc.com` subdomain
- Ensure all API keys and secrets are properly managed
- Monitor usage and implement scaling as needed
