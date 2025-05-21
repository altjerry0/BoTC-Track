const functions = require('firebase-functions/v1');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();

// Robust CORS handling for Chrome extension and localhost
const allowedOrigins = [
  'chrome-extension://leicmnbiojnfagjnciffpbejagpiaiod',
  'chrome-extension://ecmkmfkmljmneefknldphpdjlmgpdhkc',
  'https://botctracker.web.app',
  'https://trackbotc.com',
  'https://www.trackbotc.com',
  'https://auth.trackbotc.com',
  'https://auth-botctracker.web.app'
];
const corsOptions = {
  origin: function (origin, callback) {
    // console.log('CORS check for origin:', origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Explicit OPTIONS handlers for preflight
app.options('*', cors(corsOptions));
app.options('/auth/exchange-token', cors(corsOptions));

// Log all requests to help debug CORS issues
app.use((req, res, next) => {
  // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // console.log('Origin:', req.headers.origin);
  // console.log('Headers:', req.headers);
  next();
});

// Debug endpoint for CORS
app.get('/test-cors', cors(corsOptions), (req, res) => {
  res.json({ message: 'CORS is working!', origin: req.headers.origin });
});

// Catch-all error handler for CORS and other errors
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  if (err.message && err.message.startsWith('Not allowed by CORS')) {
    res.status(403).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize Firebase Admin SDK
// Note: In production, use environment variables or secret management
try {
  const serviceAccount = require('./service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://botctracker.firebaseio.com"
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  // If running in Cloud Functions, use the default credentials
  admin.initializeApp();
}

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
    
    // Verify the Google token by fetching user info using axios
    let googleUserInfo;
    try {
      const googleUserInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${googleToken}` } }
      );
      googleUserInfo = googleUserInfoResponse.data;
    } catch (error) {
      console.error('Error fetching Google user info:', error.response ? error.response.data : error.message);
      return res.status(401).json({ error: 'Invalid or expired Google token', details: error.response ? error.response.data : error.message });
    }
    
    if (!googleUserInfo || !googleUserInfo.sub) { // googleUserInfo.sub is the Google User ID
      return res.status(401).json({ error: 'Failed to get valid Google user info or UID missing' });
    }
    
    // Extracted user information
    const googleUserEmail = googleUserInfo.email;
    const googleUserName = googleUserInfo.name;
    const googleUserPicture = googleUserInfo.picture;
    // googleUserInfo.sub is the unique Google User ID, used when creating a new Firebase user.

    // Check if user exists in Firebase Auth
    try {
      // Try to get the user by email
      const userRecord = await admin.auth().getUserByEmail(googleUserEmail);
      console.log('Existing user found:', userRecord.uid);
      
      // Create a custom token for this existing user
      const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);
      return res.json({ token: firebaseToken, user: userRecord });
      
    } catch (userError) {
      if (userError.code === 'auth/user-not-found') {
        // User doesn't exist, create a new one
        console.log('Creating new Firebase user for:', googleUserEmail);
        
        const newUser = await admin.auth().createUser({
          // Using googleUserInfo.sub (Google's UID) for Firebase UID is good practice if it's available and stable
          // However, if relying on getUserByEmail and letting Firebase assign UID, ensure consistency.
          // For simplicity here, we'll let Firebase assign UID if creating by email, or use sub if we want to force it.
          // Let's stick to creating by email and letting Firebase handle UID generation primarily for this path,
          // unless a specific requirement to align UIDs with Google's `sub` is paramount and always possible.
          email: googleUserEmail,
          displayName: googleUserName,
          photoURL: googleUserPicture,
          emailVerified: googleUserInfo.email_verified || false
        });
        
        // Create a custom token for the new user
        const firebaseToken = await admin.auth().createCustomToken(newUser.uid);
        return res.json({ token: firebaseToken, user: newUser });
      } else {
        // Some other error occurred trying to get or create the user
        throw userError; // Re-throw to be caught by the outer catch block
      }
    }
    
  } catch (error) {
    console.error('Token exchange error:', error);
    // Ensure error.message is passed for client-side details if available
    res.status(500).json({ error: 'Failed to exchange token', details: error.message || 'Internal server error' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
// Attempting v1 specific syntax for runtime options
exports.api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 15
    // memory: '256MB' // Example if you needed to set memory
  })
  .https.onRequest(app);
