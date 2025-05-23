/**
 * Environment-specific configuration for the BotC Tracker extension
 */

// Detect environment: When running in the Chrome Web Store, there is no 'key' field in the manifest
export const isProduction = !chrome.runtime.getManifest().key;

// OAuth configuration - with separate client IDs for different browsers
export const authConfig = {
  // Chrome Extension client ID (from manifest.json)
  chromeClientId: chrome.runtime.getManifest().oauth2.client_id,
  
  // Web Application client ID for Brave - needs to be created in Google Cloud Console
  // TODO: Replace this placeholder with your Web Application OAuth client ID
  braveClientId: "234038964353-3rfnfsdh051r8g9aqrl4h7uo9f9c339u.apps.googleusercontent.com",
  
  // Web Application client ID for Edge - same as Brave for now, update if needed
  edgeClientId: "234038964353-3rfnfsdh051r8g9aqrl4h7uo9f9c339u.apps.googleusercontent.com",
  
  // For backward compatibility (used in places where we haven't updated code yet)
  get clientId() {
    return this.chromeClientId;
  },

  // OAuth scopes (same for all environments)
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
};

// Firebase configuration (same for both environments)
export const firebaseConfig = {
  apiKey: "AIzaSyDVk_kuvYQ_JH700jKXrdSpOtcd3DFC9Rs",
  authDomain: "botctracker.firebaseapp.com",
  projectId: "botctracker",
  storageBucket: "botctracker.appspot.com",
  messagingSenderId: "234038964353",
  appId: "1:234038964353:web:94c42aa23b68e003fd9d80",
  measurementId: "G-C4FLY32JKZ"
};

// Other environment-specific configuration can be added here
export const debugLogging = !isProduction; // Enable detailed logs only in development
//? '234038964353-6dienniai2uaso131mp9o9cm9k8mkagd.apps.googleusercontent.com' // Production client ID
// : '234038964353-n0d5jf4jfj5cunqlm8el1ull04trvj9v.apps.googleusercontent.com', // Development client ID