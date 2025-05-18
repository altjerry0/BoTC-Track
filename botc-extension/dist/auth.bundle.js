/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/config.js
/**
 * Environment-specific configuration for the BotC Tracker extension
 */

// Detect environment: When running in the Chrome Web Store, there is no 'key' field in the manifest
var isProduction = !chrome.runtime.getManifest().key;

// OAuth configuration with environment-specific client IDs
var authConfig = {
  // Use different client IDs for development and production
  clientId: isProduction ? 'production-client-id.apps.googleusercontent.com' // Replace with your production client ID
  : '234038964353-fmvng5skv7bamhgl2f5142pdvclj4du4.apps.googleusercontent.com',
  // Your existing development client ID

  // OAuth scopes (same for both environments)
  scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
};

// Firebase configuration (same for both environments)
var firebaseConfig = {
  // Your Firebase configuration here
  // This could also be environment-specific if needed
};

// Other environment-specific configuration can be added here
var debugLogging = !isProduction; // Enable detailed logs only in development
;// ./src/auth/auth.js
// Import the configuration


// Log environment information in development mode
if (debugLogging) {
  console.log("[Auth] Running in ".concat(isProduction ? 'PRODUCTION' : 'DEVELOPMENT', " environment"));
  console.log("[Auth] Using client ID: ".concat(authConfig.clientId));
}

// DOM elements
var signInButton = document.getElementById('signInButton');
var statusElement = document.getElementById('status');
var loaderElement = document.getElementById('loader');

// Helper functions
function updateStatus(message) {
  var isError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  statusElement.textContent = message;
  statusElement.className = isError ? 'error' : 'success';
}
function showLoader() {
  var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  loaderElement.style.display = show ? 'block' : 'none';
  signInButton.disabled = show;
}

// Communicate with the background script for authentication
function signInWithGoogle() {
  showLoader(true);
  updateStatus('Initializing authentication...');

  // Request authentication from the background script
  chrome.runtime.sendMessage({
    type: 'AUTH_TAB_LOGIN'
  }, function (response) {
    if (chrome.runtime.lastError) {
      console.error('Error communicating with background script:', chrome.runtime.lastError);
      updateStatus("Authentication failed: ".concat(chrome.runtime.lastError.message), true);
      showLoader(false);
      return;
    }
    if (response && response.success) {
      // Store user info from the response
      var userData = response.user;

      // Save to Chrome storage
      chrome.storage.local.set({
        authUser: userData
      }, function () {
        updateStatus('Successfully signed in! You can close this tab.');
        showLoader(false);

        // Auto close after 3 seconds
        setTimeout(function () {
          window.close();
        }, 3000);
      });
    } else {
      // If there was an error in the authentication process
      var errorMessage = response && response.error ? response.error : 'Unknown error';
      console.error('Authentication error:', errorMessage);
      updateStatus("Sign-in failed: ".concat(errorMessage), true);
      showLoader(false);
    }
  });
}

// Event listeners
signInButton.addEventListener('click', signInWithGoogle);

// Auto-start sign-in when page loads (optional)
// document.addEventListener('DOMContentLoaded', signInWithGoogle);
/******/ })()
;