const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();
app.use(cors({ origin: true })); // For development. In production, restrict to your extension origin
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
// Note: In production, use environment variables or secret management
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://botctracker.firebaseio.com"
});

/**
 * Endpoint to exchange a Google token for a Firebase custom token
 * This allows the extension to authenticate without external script loading
 */
app.post('/auth/exchange-token', async (req, res) => {
  try {
    const { googleToken } = req.body;
    
    if (!googleToken) {
      return res.status(400).json({ error: 'Missing Google token' });
    }
    
    // Verify the Google token by fetching user info
    const googleUserInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${googleToken}` } }
    );
    
    const googleUserInfo = googleUserInfoResponse.data;
    
    if (!googleUserInfo || !googleUserInfo.sub) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    
    // Check if user exists in Firebase Auth
    try {
      // Try to get the user by email
      const userRecord = await admin.auth().getUserByEmail(googleUserInfo.email);
      console.log('Existing user found:', userRecord.uid);
      
      // Create a custom token for this existing user
      const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);
      return res.json({ token: firebaseToken, user: userRecord });
      
    } catch (userError) {
      // User doesn't exist, create a new one
      console.log('Creating new Firebase user for:', googleUserInfo.email);
      
      const newUser = await admin.auth().createUser({
        email: googleUserInfo.email,
        displayName: googleUserInfo.name,
        photoURL: googleUserInfo.picture
      });
      
      // Create a custom token for the new user
      const firebaseToken = await admin.auth().createCustomToken(newUser.uid);
      return res.json({ token: firebaseToken, user: newUser });
    }
    
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Firebase Auth service running on port ${PORT}`);
});
