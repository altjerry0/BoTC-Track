import { initializeApp } from "../../node_modules/firebase/app/dist/index.esm.js";
import { getAuth, signInWithCustomToken } from "../../node_modules/firebase/auth/dist/index.esm.js";
import { firebaseConfig } from "../config.js";
import { parseJwt } from "../utils/auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Listen for auth token updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_TOKENS_UPDATED') {
    handleAuthTokens(message.data);
  }
});

async function handleAuthTokens({ firebaseCustomToken, user }) {
  try {
    // Sign in with Firebase using the custom token
    const userCredential = await signInWithCustomToken(auth, firebaseCustomToken);
    const firebaseUser = userCredential.user;

    // Update the stored user info with the actual Firebase user data
    await chrome.storage.local.set({
      authUser: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      }
    });

    console.log('[Popup Auth] Successfully signed in with Firebase');
    
    // Notify any components that need to know about the auth state
    document.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: firebaseUser } 
    }));
  } catch (error) {
    console.error('[Popup Auth] Error signing in with Firebase:', error);
  }
}

// Initialize auth state from storage
chrome.storage.local.get(['firebaseCustomToken', 'authUser'], async (result) => {
  if (result.firebaseCustomToken && result.authUser) {
    await handleAuthTokens({
      firebaseCustomToken: result.firebaseCustomToken,
      user: result.authUser
    });
  }
});
