// Import the configuration
import { authConfig, isProduction, debugLogging } from '../config.js';

// Log environment information in development mode
if (debugLogging) {
    console.log(`[Auth] Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment`);
    console.log(`[Auth] Using client ID: ${authConfig.clientId}`);
}

// DOM elements
const signInButton = document.getElementById('signInButton');
const statusElement = document.getElementById('status');
const loaderElement = document.getElementById('loader');

// Helper functions
function updateStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.className = isError ? 'error' : 'success';
}

function showLoader(show = true) {
    loaderElement.style.display = show ? 'block' : 'none';
    signInButton.disabled = show;
}

// Communicate with the background script for authentication
function signInWithGoogle() {
    showLoader(true);
    updateStatus('Initializing authentication...');
    
    // Request authentication from the background script
    chrome.runtime.sendMessage({ type: 'AUTH_TAB_LOGIN' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error communicating with background script:', chrome.runtime.lastError);
            updateStatus(`Authentication failed: ${chrome.runtime.lastError.message}`, true);
            showLoader(false);
            return;
        }
        
        if (response && response.success) {
            // Store user info from the response
            const userData = response.user;
            
            // Save to Chrome storage
            chrome.storage.local.set({ authUser: userData }, () => {
                updateStatus('Successfully signed in! You can close this tab.');
                showLoader(false);
                
                // Auto close after 3 seconds
                setTimeout(() => {
                    window.close();
                }, 3000);
            });
        } else {
            // If there was an error in the authentication process
            const errorMessage = response && response.error ? response.error : 'Unknown error';
            console.error('Authentication error:', errorMessage);
            updateStatus(`Sign-in failed: ${errorMessage}`, true);
            showLoader(false);
        }
    });
}

// Event listeners
signInButton.addEventListener('click', signInWithGoogle);

// Auto-start sign-in when page loads (optional)
// document.addEventListener('DOMContentLoaded', signInWithGoogle);
