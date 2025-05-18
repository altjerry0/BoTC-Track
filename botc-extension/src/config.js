/**
 * Environment-specific configuration for the BotC Tracker extension
 */

// Detect environment: When running in the Chrome Web Store, there is no 'key' field in the manifest
export const isProduction = !chrome.runtime.getManifest().key;

// OAuth configuration - get client ID from manifest to ensure consistency
export const authConfig = {
  // Use the client ID from the manifest.json to avoid inconsistencies
  clientId: chrome.runtime.getManifest().oauth2.client_id,

  // OAuth scopes (same for both environments)
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
};

// Firebase configuration (same for both environments)
export const firebaseConfig = {
  // Your Firebase configuration here
  // This could also be environment-specific if needed
};

// Other environment-specific configuration can be added here
export const debugLogging = !isProduction; // Enable detailed logs only in development
//? '234038964353-6dienniai2uaso131mp9o9cm9k8mkagd.apps.googleusercontent.com' // Production client ID
// : '234038964353-fmvng5skv7bamhgl2f5142pdvclj4du4.apps.googleusercontent.com', // Development client ID