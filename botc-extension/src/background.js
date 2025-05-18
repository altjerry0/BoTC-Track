// --- Firebase Initialization (v1.1.5 Cloud Sync Groundwork) ---
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, onAuthStateChanged } from "firebase/auth";
import { authConfig, isProduction, debugLogging } from "./config.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// TODO: Replace with your actual Firebase config
// Google OAuth Web Client ID is now imported from config.js
const GOOGLE_OAUTH_WEB_CLIENT_ID = authConfig.clientId;

// Log the environment and client ID being used (only in development)
if (debugLogging) {
    console.log(`[BG] Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment`);
    console.log(`[BG] Using OAuth client ID: ${GOOGLE_OAUTH_WEB_CLIENT_ID}`);
}

const firebaseConfig = {
    apiKey: "AIzaSyDVk_kuvYQ_JH700jKXrdSpOtcd3DFC9Rs",
    authDomain: "botctracker.firebaseapp.com",
    projectId: "botctracker",
    storageBucket: "botctracker.firebasestorage.app",
    messagingSenderId: "234038964353",
    appId: "1:234038964353:web:94c42aa23b68e003fd9d80",
    measurementId: "G-C4FLY32JKZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Firestore sync functions

/**
 * Ensures the user document exists in Firestore
 * @param {string} userId - The authenticated user ID
 * @param {Object} userData - Basic user profile data
 * @returns {Promise<void>}
 */
async function ensureUserDocumentExists(userId, userData) {
    if (!userId) {
        console.error('[Firestore] Cannot create user document: No user ID provided');
        return;
    }
    
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            // Create the user document if it doesn't exist
            await setDoc(userDocRef, {
                profile: {
                    email: userData.email || null,
                    displayName: userData.displayName || null,
                    lastSyncTimestamp: serverTimestamp()
                },
                // Initialize with empty player data
                playerData: {
                    version: 1,
                    lastUpdated: Date.now(),
                    data: {}
                }
            });
            console.log('[Firestore] Created new user document for:', userId);
        } else {
            console.log('[Firestore] User document already exists for:', userId);
        }
    } catch (error) {
        console.error('[Firestore] Error ensuring user document exists:', error);
    }
}

/**
 * Saves player data to Firestore
 * @param {string} userId - The authenticated user ID
 * @param {Object} playerData - The player data to save
 * @returns {Promise<boolean>} - Whether the save was successful
 */
async function savePlayerDataToFirestore(userId, playerData) {
    if (!userId) {
        console.error('[Firestore] Cannot save player data: No user ID provided');
        return false;
    }
    
    try {
        const userDocRef = doc(db, 'users', userId);
        
        // First, fetch the existing document to check what players need to be deleted
        const userDoc = await getDoc(userDocRef);
        let needsFullOverwrite = false;
        
        if (userDoc.exists()) {
            const existingData = userDoc.data();
            if (existingData && existingData.playerData && existingData.playerData.data) {
                // Compare existing player IDs with current player IDs to identify deleted players
                const existingPlayerIds = Object.keys(existingData.playerData.data);
                const currentPlayerIds = Object.keys(playerData || {});
                
                // If any players have been deleted, we need to overwrite the entire playerData
                // instead of merging to ensure deleted players are removed
                const deletedPlayerIds = existingPlayerIds.filter(id => !currentPlayerIds.includes(id));
                needsFullOverwrite = deletedPlayerIds.length > 0;
                
                if (needsFullOverwrite) {
                    console.log(`[Firestore] Detected ${deletedPlayerIds.length} deleted players. Performing full overwrite.`);
                }
            }
        }
        
        // If players were deleted, overwrite the entire playerData object
        // Otherwise, just merge updates which is more efficient
        await setDoc(userDocRef, {
            playerData: {
                version: 1,
                lastUpdated: Date.now(),
                data: playerData || {}
            }
        }, { merge: !needsFullOverwrite });
        
        console.log('[Firestore] Player data saved to Firestore for user:', userId);
        return true;
    } catch (error) {
        console.error('[Firestore] Error saving player data to Firestore:', error);
        return false;
    }
}

/**
 * Loads player data from Firestore
 * @param {string} userId - The authenticated user ID
 * @returns {Promise<Object>} - The loaded player data or null if not found
 */
async function loadPlayerDataFromFirestore(userId) {
    if (!userId) {
        console.error('[Firestore] Cannot load player data: No user ID provided');
        return null;
    }
    
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            console.log('[Firestore] No user document found for:', userId);
            return null;
        }
        
        const userData = userDoc.data();
        if (!userData.playerData || !userData.playerData.data) {
            console.log('[Firestore] User has no player data stored yet');
            return {};
        }
        
        console.log('[Firestore] Loaded player data from Firestore for user:', userId);
        return userData.playerData.data;
    } catch (error) {
        console.error('[Firestore] Error loading player data from Firestore:', error);
        return null;
    }
}

/**
 * Synchronizes player data between local storage and Firestore
 * @param {string} userId - The authenticated user ID
 * @returns {Promise<Object>} - The synchronized player data
 */
async function syncPlayerData(userId) {
    if (!userId) {
        console.error('[Firestore] Cannot sync player data: No user ID provided');
        return null;
    }
    
    try {
        // Get local player data
        const localData = await new Promise(resolve => {
            chrome.storage.local.get('playerData', (result) => {
                resolve(result.playerData || {});
            });
        });
        
        // Get remote player data
        const remoteData = await loadPlayerDataFromFirestore(userId);
        
        if (!remoteData) {
            // No remote data exists, upload local data
            if (Object.keys(localData).length > 0) {
                await savePlayerDataToFirestore(userId, localData);
                console.log('[Firestore] Uploaded local player data to Firestore');
            }
            return localData;
        }
        
        // Merge local and remote data (simple strategy: prefer remote data)
        // In a more sophisticated version, you might want to do a field-by-field comparison
        // based on timestamps or implement a more complex conflict resolution strategy
        const mergedData = { ...localData, ...remoteData };
        
        // Save merged data locally
        await new Promise(resolve => {
            chrome.storage.local.set({ playerData: mergedData }, resolve);
        });
        
        // Save merged data remotely
        await savePlayerDataToFirestore(userId, mergedData);
        
        console.log('[Firestore] Player data synchronized successfully');
        return mergedData;
    } catch (error) {
        console.error('[Firestore] Error syncing player data:', error);
        return null;
    }
}

// Listen for auth state changes and handle Firestore initialization
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("[Firebase] User signed in:", user.uid, user.email);
    
    // Store the authenticated user info in storage for access across contexts
    chrome.storage.local.set({ 'authUser': { 
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null
    }}, () => {
      console.log("[Firebase] Auth user info saved to storage");
    });
    
    // Ensure user document exists in Firestore
    ensureUserDocumentExists(user.uid, {
        email: user.email,
        displayName: user.displayName
    });
    
    // No automatic sync - will be done on demand
  } else {
    console.log("[Firebase] User signed out");
    // Clear auth user from storage when signed out
    chrome.storage.local.remove('authUser');
  }
});

/**
 * Pushes local player data to Firestore
 * @returns {Promise<Object>} - Result of the operation
 */
async function pushLocalDataToCloud() {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not signed in' };
    }
    
    // Get local player data
    const localData = await new Promise(resolve => {
      chrome.storage.local.get('playerData', (result) => {
        resolve(result.playerData || {});
      });
    });
    
    // Validate local data
    if (!localData || Object.keys(localData).length === 0) {
      return { success: false, error: 'No local player data to push' };
    }
    
    // Save to Firestore
    const success = await savePlayerDataToFirestore(user.uid, localData);
    
    return { 
      success, 
      updated: success,
      error: success ? null : 'Failed to save data to Firestore'
    };
  } catch (error) {
    console.error('[Firestore] Error pushing local data to cloud:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}

/**
 * Fetches player data from Firestore and updates local storage
 * @returns {Promise<Object>} - Result of the operation
 */
async function fetchCloudDataToLocal() {
    try {
        console.log('[Firestore] Fetching cloud data to local');
        
        // Get auth user from storage for better reliability across contexts
        const authUser = await new Promise(resolve => {
            chrome.storage.local.get('authUser', result => {
                resolve(result.authUser || null);
            });
        });
        
        // Check if user is authenticated
        if (!authUser || !authUser.uid) {
            // Fallback to checking auth.currentUser directly if storage doesn't have it
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                console.warn('[Firestore] Cannot fetch cloud data: User not authenticated');
                return { success: false, error: 'User not authenticated' };
            }
            
            // If found in auth but not in storage, update storage
            chrome.storage.local.set({ 'authUser': { 
                uid: currentUser.uid,
                email: currentUser.email || null,
                displayName: currentUser.displayName || null
            }}); 
            
            authUser = { uid: currentUser.uid };
        }
        
        const userId = authUser.uid;
        console.log('[Firestore] Fetching data for user:', userId);
        
        // Load player data from Firestore
        const cloudPlayerData = await loadPlayerDataFromFirestore(userId);
        
        if (!cloudPlayerData) {
            console.warn('[Firestore] No cloud data found or permissions issue for user:', userId);
            return { success: false, error: 'No cloud data found or permissions issue' };
        }
        
        // Save to local storage
        await new Promise(resolve => {
            chrome.storage.local.set({ playerData: cloudPlayerData }, resolve);
        });
        
        console.log('[Firestore] Cloud data fetched and saved to local storage');
        
        return { success: true, playerData: cloudPlayerData };
    } catch (error) {
        console.error('[Firestore] Error fetching cloud data to local:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

// --- Message Listener from Content Script or Popup ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Firebase Auth: Handle login/logout requests from popup
    if (request.type === 'LOGIN_WITH_GOOGLE') {
        console.log('[BG Auth] Login with Google requested');
        // This route is kept for backward compatibility
        // But we'll redirect to the new AUTH_TAB approach
        sendResponse({ 
            success: false, 
            error: 'Please use the auth tab for login', 
            redirect: true 
        });
        return true; // async
    }
    
    if (request.type === 'AUTH_TAB_LOGIN') {
        console.log('[BG Auth] Login requested from auth tab');
        
        // Use Chrome's identity API directly instead of Firebase popup
        // This uses the OAuth flow defined in the manifest.json
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                console.error('[BG Auth] Chrome identity error:', chrome.runtime.lastError);
                sendResponse({ 
                    success: false, 
                    error: chrome.runtime.lastError.message 
                });
                return;
            }
            
            // Get user info using the token
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user info: ' + response.statusText);
                }
                return response.json();
            })
            .then(userInfo => {
                console.log('[BG Auth] Got user info:', userInfo);
                
                // Create a credential from the access token
                const credential = GoogleAuthProvider.credential(null, token);
                
                // Sign in to Firebase with the credential
                return signInWithCredential(auth, credential).then(result => {
                    console.log('[Firebase] Successfully signed in with credential:', result.user.uid);
                    
                    // Create a user object including Firebase UID
                    const userData = {
                        uid: result.user.uid,
                        email: userInfo.email,
                        displayName: userInfo.name,
                        photoURL: userInfo.picture
                    };
                    
                    // Store the token for later use
                    return chrome.storage.local.set({ 
                        googleAuthToken: token,
                        authUser: userData
                    }).then(() => {
                        // Ensure user document exists in Firestore
                        return ensureUserDocumentExists(result.user.uid, {
                            email: userInfo.email,
                            displayName: userInfo.name
                        }).then(() => {
                            sendResponse({ 
                                success: true, 
                                user: userData
                            });
                        });
                    });
                });

            })
            .catch(error => {
                console.error('[BG Auth] Error getting user info:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
        });
        
        return true; // async
    }
    if (request.type === 'LOGOUT') {
        // Get the current token and revoke it
        chrome.storage.local.get('googleAuthToken', (result) => {
            const token = result.googleAuthToken;
            if (token) {
                // Revoke the token with Google
                chrome.identity.removeCachedAuthToken({ token }, () => {
                    console.log('[BG Auth] Auth token cache cleared');
                });
                
                // Optional: Call Google's revocation endpoint
                fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
                    method: 'GET'
                }).catch(error => {
                    console.warn('[BG Auth] Error revoking token with Google:', error);
                    // Continue with logout even if revocation fails
                });
            }
            
            // Remove auth data from storage
            chrome.storage.local.remove(['authUser', 'googleAuthToken'], () => {
                if (chrome.runtime.lastError) {
                    console.error('[BG Auth] Error removing auth data from storage:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    return;
                }
                console.log('[BG Auth] User signed out (auth data removed from storage)');
                sendResponse({ success: true });
            });
        });
        return true; // async
    }

    // console.log(`[BG Message] Received message:`, request, `from sender:`, sender);

    if (request.type === 'GET_AUTH_TOKEN') {
        // console.log('[BG Auth] Received request for auth token.');
        chrome.storage.local.get(['authToken'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG Auth] Error retrieving auth token:', chrome.runtime.lastError);
                sendResponse({ token: null, error: chrome.runtime.lastError.message });
            } else {
                const token = result.authToken || null;
                // console.log('[BG Auth] Sending auth token:', token ? '********' : 'null'); // Mask token in log
                sendResponse({ token: token });
            }
        });
        return true; // Crucial: Indicate async response

    } else if (request.type === 'GET_PLAYER_DATA') {
        // console.log('[BG PlayerData] Received request for player data.');
        chrome.storage.local.get('playerData', (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG PlayerData] Error fetching player data:', chrome.runtime.lastError);
                sendResponse({ playerData: {}, error: chrome.runtime.lastError.message });
            } else {
                // console.log('[BG PlayerData] Sending player data:', result.playerData ? Object.keys(result.playerData).length + ' players' : '{}');
                sendResponse({ playerData: result.playerData || {} });
            }
        });
        return true; // Crucial: Indicate async response

    } else if (request.type === 'SAVE_PLAYER_DATA') {
        // console.log('[BG Save] Received request to save player data.');
        if (request.payload) {
            chrome.storage.local.set({ playerData: request.payload }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[BG Save] Error saving player data:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    return;
                }
                
                // Only save locally, no automatic Firestore sync
                console.log('[BG Save] Player data saved to local storage');
                sendResponse({ success: true });
            });
            return true; // Indicate asynchronous response for storage set
        } else {
            console.error("[BG Save] Received SAVE_PLAYER_DATA request without payload.");
            sendResponse({ success: false, error: "Missing payload" });
        }
    } else if (request.type === 'PUSH_TO_CLOUD') {
        // Manual push of local data to Firestore
        chrome.storage.local.get(['authUser', 'playerData'], async (result) => {
            const authUser = result.authUser;
            const playerData = result.playerData || {};
            
            if (!authUser || !authUser.uid) {
                sendResponse({ success: false, error: 'User not authenticated' });
                return;
            }
            
            try {
                await savePlayerDataToFirestore(authUser.uid, playerData);
                console.log('[BG Push] Player data pushed to Firestore');
                sendResponse({ success: true });
            } catch (error) {
                console.error('[BG Push] Error pushing to Firestore:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
        return true; // Indicate asynchronous response
    } else if (request.type === 'FETCH_FROM_CLOUD') {
        // Manual fetch of remote data from Firestore
        chrome.storage.local.get('authUser', async (result) => {
            const authUser = result.authUser;
            if (!authUser || !authUser.uid) {
                sendResponse({ success: false, error: 'User not authenticated' });
                return;
            }
            
            try {
                const remoteData = await loadPlayerDataFromFirestore(authUser.uid);
                if (remoteData) {
                    // Save to local storage
                    chrome.storage.local.set({ playerData: remoteData }, () => {
                        console.log('[BG Fetch] Player data fetched from Firestore and saved locally');
                        sendResponse({ success: true, data: remoteData });
                    });
                } else {
                    sendResponse({ success: false, error: 'No data found in cloud' });
                }
            } catch (error) {
                console.error('[BG Fetch] Error fetching from Firestore:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
        return true; // Indicate asynchronous response

    } else if (request.type === 'PUSH_TO_CLOUD') {
        console.log('[BG Sync] Pushing local data to cloud');
        pushLocalDataToCloud().then(result => {
            console.log('[BG Sync] Push result:', result);
            sendResponse(result);
        }).catch(error => {
            console.error('[BG Sync] Push error:', error);
            sendResponse({ success: false, error: error.message || 'Unknown error occurred' });
        });
        return true; // async
    } else if (request.type === 'FETCH_FROM_CLOUD') {
        console.log('[BG Sync] Fetching cloud data to local');
        fetchCloudDataToLocal().then(result => {
            console.log('[BG Sync] Fetch result:', result);
            sendResponse(result);
        }).catch(error => {
            console.error('[BG Sync] Fetch error:', error);
            sendResponse({ success: false, error: error.message || 'Unknown error occurred' });
        });
        return true; // async
    } else if (request.type === 'GET_AUTH_STATE') { // Handler for account tab auth state requests
        console.log('[BG Auth] Received request for auth state.');
        // Check for auth user in Chrome storage instead of direct Firebase access
        chrome.storage.local.get('authUser', (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG Auth] Error getting auth user from storage:', chrome.runtime.lastError);
                sendResponse({ user: null, error: chrome.runtime.lastError.message });
                return;
            }
            
            if (result && result.authUser) {
                sendResponse({ user: result.authUser });
            } else {
                sendResponse({ user: null });
            }
        });
        return true; // Indicate async response

    } else if (request.type === 'GET_CURRENT_GAME_INFO') { // Handler for requests from popup
        // Private game detection now happens through the normal sessions endpoint
        // Return null since we're not detecting current game through content script anymore
        sendResponse({ gameInfo: null });
        // This one is synchronous, no need to return true

    } else if (request.type === 'GET_USERNAME_BY_ID') {
        const playerIdToLookup = request.payload.playerId;
        if (!playerIdToLookup) {
            sendResponse({ error: 'Player ID missing' });
        } else {
            chrome.storage.local.get('authToken', (result) => {
                const authToken = result.authToken;
                if (!authToken) {
                    sendResponse({ error: 'Auth token not found for username lookup.' });
                } else {
                    fetch(`https://botc.app/backend/user/${playerIdToLookup}`, {
                        headers: { 'Authorization': authToken }
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().catch(() => ({ message: response.statusText })).then(errorData => {
                                throw new Error(`API error fetching username (${response.status}): ${errorData.message || response.statusText}`);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        const username = data && data.user ? data.user.username : null;
                        if (!username) {
                            throw new Error(`Username not found in API response for ID ${playerIdToLookup}`);
                        }
                        sendResponse({ username: username });
                    })
                    .catch(error => {
                        console.error(`[BG Lookup] Error fetching username for ID ${playerIdToLookup}:`, error);
                        sendResponse({ error: error.message });
                    });
                }
            });
            return true; // Indicate async response
        }

    } else if (request.action) { // Fallback to action-based handling for older messages or specific actions
        switch (request.action) {
            case "requestSession": // Note: Combined case for fetchSessions for clarity or remove if only one is used
            case "fetchSessions":
                chrome.storage.local.get('authToken', (result) => {
                    const currentAuthToken = result.authToken || authToken; // Prefer stored token
                    if (!currentAuthToken) {
                        console.warn("[BG Popup Fetch] Auth token missing for session fetch.");
                        sendResponse({ error: "Authorization token not available" });
                        return; // Exit from chrome.storage.local.get callback
                    }

                    fetch("https://botc.app/backend/sessions", {
                        method: "GET",
                        headers: { "Authorization": currentAuthToken }
                    })
                    .then(response => {
                        if (!response.ok) {
                            // Attempt to parse error as JSON, otherwise use statusText
                            return response.json().catch(() => null) // if error response isn't valid JSON
                                .then(errorBody => {
                                    const errorMessage = errorBody ? (errorBody.message || JSON.stringify(errorBody)) : response.statusText;
                                    const detailedError = `API Error ${response.status}: ${errorMessage}`;
                                    console.error(`[BG Popup Fetch] ${detailedError}`);
                                    throw new Error(detailedError); // This will be caught by the .catch() below
                                });
                        }
                        return response.json(); // If response.ok, parse and return JSON
                    })
                    .then(sessionsData => {
                        // Check if the API, despite a 200 OK, returned an error structure
                        if (sessionsData && typeof sessionsData.error !== 'undefined') {
                            console.error("[BG Popup Fetch] API returned 200 OK but with an error payload:", sessionsData.error);
                            sendResponse({ error: sessionsData.error });
                        } else {
                            sendResponse({ sessions: sessionsData });
                        }
                    })
                    .catch(error => {
                        // Catches errors from fetch() network issues or the !response.ok block's throw
                        console.error("[BG Popup Fetch] Error fetching sessions for popup:", error.message);
                        sendResponse({ error: error.message || "Failed to fetch sessions due to an unknown server error." });
                    });
                });
                return true; // Crucial: Indicates that sendResponse will be called asynchronously

            case "savePlayerData": // This is now handled by request.type === 'SAVE_PLAYER_DATA'
                if (request.playerData) { // Note: older format used .playerData, new uses .payload
                    chrome.storage.local.set({ playerData: request.playerData }, () => {
                        // console.log("[BG Save] Player data saved via popup request (action: savePlayerData).");
                        if (chrome.runtime.lastError) {
                            console.error("[BG Save] Error saving player data:", chrome.runtime.lastError);
                            sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        } else {
                            sendResponse({ success: true });
                        }
                    });
                    return true; // Indicate asynchronous response for storage set
                } else {
                    console.error("[BG Save] Received savePlayerData (action) request without playerData.");
                    sendResponse({ success: false, error: "Missing playerData" });
                }
                break;
            
            default:
                console.warn('[BG Message] Received unknown action in message:', request);
                sendResponse({ status: 'error', message: 'Unknown action in message' });
                // Synchronous response here, no need to return true
                break;
        }
    } else {
        console.warn('[BG Message] Received message with no recognized type or action:', request);
        sendResponse({ status: 'error', message: 'Unrecognized message format' });
    }
});

// Helper to get auth token as a promise
function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('authToken', (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG Auth Helper] Error getting auth token:', chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.authToken);
            }
        });
    });
}

// --- Alarms and Periodic Tasks ---
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    setupSessionFetchAlarm(); // Setup alarm on install
});

chrome.runtime.onStartup.addListener(() => {
    console.log("Extension startup");
    setupSessionFetchAlarm(); // Setup alarm on startup
});

let authToken = null;
let liveGameInfo = null; // Added to store live game info from content script
const FETCH_ALARM_NAME = 'fetchBotcSessionsAlarm';
const FETCH_PERIOD_MINUTES = 1; // Fetch every 1 minute

// Function to setup the alarm for fetching session data
function setupSessionFetchAlarm() {
    chrome.alarms.get(FETCH_ALARM_NAME, (alarm) => {
        if (!alarm) {
            chrome.alarms.create(FETCH_ALARM_NAME, {
                delayInMinutes: 1, // Wait 1 minute before the first fetch
                periodInMinutes: FETCH_PERIOD_MINUTES
            });
            console.log(`Alarm "${FETCH_ALARM_NAME}" created. Runs every ${FETCH_PERIOD_MINUTES} mins after initial 1 min delay.`);
        } else {
            console.log(`Alarm "${FETCH_ALARM_NAME}" already exists.`);
        }
    });
}

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === FETCH_ALARM_NAME) {
        console.log("[BG_ALARM] Alarm triggered: fetchBotcSessionsAlarm");

        // Check if botc.app is open before proceeding
        chrome.tabs.query({ url: "*://botc.app/*", status: "complete" }, (tabs) => { // Added status: "complete" to ensure tab is loaded
            if (!tabs || tabs.length === 0) {
                console.log('[BG_ALARM] botc.app is not open or not fully loaded. Skipping background fetch.');
                // Optional: Consider if the alarm should be cleared or rescheduled if botc.app remains closed for too long.
                // For now, it will simply skip this cycle.
                return;
            }

            // botc.app is open, proceed with fetching data
            chrome.storage.local.get(['authToken', 'playerData'], (result) => {
                if (result.authToken && result.playerData) {
                    fetchAndProcessSessionsInBackground(result.authToken, result.playerData);
                } else {
                    console.warn("[BG_ALARM] Auth token or player data not found. Skipping background fetch even though botc.app is open.");
                }
            });
        });
    }
});

// Core logic to fetch sessions and update player data in the background
function fetchAndProcessSessionsInBackground(token, playerData) {
    console.log('[BG_FETCH] Starting background fetch. Known player count:', Object.keys(playerData).length);
    fetch("https://botc.app/backend/sessions", {
        method: "GET",
        headers: { "Authorization": token }
    })
    .then(response => {
        if (!response.ok) {
            // Try to parse error if JSON, otherwise use statusText
            return response.json().catch(() => null).then(errorData => {
                const errorMessage = errorData ? JSON.stringify(errorData) : response.statusText;
                console.error(`[BG_FETCH] API Error ${response.status}: ${errorMessage}`);
                throw new Error(`API Error ${response.status}: ${errorMessage}`);
            });
        }
        return response.json();
    })
    .then(sessionsData => {
        if (sessionsData && Array.isArray(sessionsData)) {
            let playerDataUpdated = false;
            sessionsData.forEach(session => {
                const currentSessionIdentifier = session.name ? session.name.toString() : null;
                
                if (!currentSessionIdentifier) {
                    console.warn(`[BG_FETCH] Encountered a session from API with a missing or null name (identifier). Raw session.id from API was: '${session.id}'. Session data:`, session);
                }

                if (session.usersAll && Array.isArray(session.usersAll)) {
                    session.usersAll.forEach(userInSession => {
                        const userId = userInSession.id ? userInSession.id.toString() : null;
                        const userNameFromApi = userInSession.username ? userInSession.username.trim() : null;
                        
                        if (userId && playerData[userId]) {
                            const player = playerData[userId];
                            let playerActivityUpdatedThisCycle = false;
                            // let usernameWasUpdated = false; // Can be inferred if oldUsername exists and is different

                            // Username update logic aligned with userManager.js
                            if (userNameFromApi && player.name !== userNameFromApi) {
                                const oldUsername = player.name;
                                player.name = userNameFromApi;
                                
                                if (!player.usernameHistory) {
                                    player.usernameHistory = [];
                                }
                                // Add old username to history if it's different from the new one and not already the most recent entry
                                const lastHistoryEntry = player.usernameHistory.length > 0 ? player.usernameHistory[0].username : null;
                                if (oldUsername && (!lastHistoryEntry || lastHistoryEntry.toLowerCase() !== oldUsername.toLowerCase())) {
                                    player.usernameHistory.unshift({ username: oldUsername, timestamp: Date.now() });
                                    console.log(`[BG_FETCH] Username change for ID ${userId}: '${oldUsername}' -> '${userNameFromApi}'. History updated.`);
                                }
                                
                                // usernameWasUpdated = true; 
                                playerActivityUpdatedThisCycle = true;
                            }

                            const now = Date.now();
                            if (Math.abs(now - (player.lastSeenTimestamp || 0)) > 1000) {
                                player.lastSeenTimestamp = now;
                                playerActivityUpdatedThisCycle = true;
                            }

                            if (currentSessionIdentifier) {
                                if (player.lastSeenSessionId !== currentSessionIdentifier) {
                                    player.lastSeenSessionId = currentSessionIdentifier;
                                    playerActivityUpdatedThisCycle = true;
                                }

                                player.sessionHistory = player.sessionHistory || [];
                                if (!player.sessionHistory.includes(currentSessionIdentifier)) {
                                    player.sessionHistory.push(currentSessionIdentifier);
                                    player.uniqueSessionCount = (player.uniqueSessionCount || 0) + 1;
                                    playerActivityUpdatedThisCycle = true;
                                }
                            } else {
                                // if (player.lastSeenSessionId !== null && !usernameWasUpdated) { // This log might be too frequent if many sessions are nameless
                                //      console.log(`[BG_FETCH]       Cannot update session-specific details for player ${userId} (Name: ${player.name}) due to missing current session identifier.`);
                                // }
                            }
                            
                            if(playerActivityUpdatedThisCycle){
                                playerDataUpdated = true;
                                // console.log(`[BG_FETCH]       Player ${userId} (Name: ${player.name}) activity/details updated. Session: '${currentSessionIdentifier || 'Unknown'}'.`); // A bit verbose
                            }
                        } else if (userId) {
                            // console.log(`[BG_FETCH]     User ID ${userId} (Username: ${userNameFromApi}) from API's usersAll not found in local playerData.`); // Can be noisy
                        } else {
                            // console.log(`[BG_FETCH]     Skipping user from API's usersAll due to missing user ID: Username=${userNameFromApi}`); // Minor
                        }
                    });
                } else {
                    // console.log(`[BG_FETCH]   Session '${currentSessionIdentifier}' has no usersAll array or it's not an array.`); // Minor
                }
            });

            if (playerDataUpdated) {
                chrome.storage.local.set({ playerData: playerData }, () => {
                    console.log('[BG_FETCH] Player data updated and saved to storage.');
                });
            } else {
                console.log('[BG_FETCH] No player data changes detected during background fetch.');
            }
        } else {
            console.log('[BG_FETCH] Received no session data or data in unexpected format.');
        }
    })
    .catch(error => {
        console.error('[BG_FETCH] Error during fetch or processing:', error);
    });
}

// Helper function to log stored data (for debugging)
function logStoredData() {
    chrome.storage.local.get(null, (items) => {
        console.log('[BG Debug] Current stored data:', items);
    });
}

// Example: Call logStoredData on startup or other events if needed for debugging
// chrome.runtime.onStartup.addListener(() => {
//     logStoredData(); 
// });

// Listen for network requests to extract the Authorization token
// Track token update timestamps to avoid too frequent storage operations
let lastTokenUpdateTime = 0;
const TOKEN_UPDATE_MIN_INTERVAL = 2000; // Minimum 2 seconds between token updates

// Token expiration management
let tokenExpirationTime = 0;
const TOKEN_ESTIMATED_LIFETIME = 30 * 60 * 1000; // 30 minutes as a safe estimate

chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const authHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "authorization");
        if (authHeader && authHeader.value.startsWith("Bearer ")) {
            const newAuthToken = authHeader.value;
            const currentTime = Date.now();
            
            // Only update if token is different or the current one is nearing expiration
            if (authToken !== newAuthToken || currentTime - lastTokenUpdateTime > TOKEN_UPDATE_MIN_INTERVAL) {
                authToken = newAuthToken;
                lastTokenUpdateTime = currentTime;
                tokenExpirationTime = currentTime + TOKEN_ESTIMATED_LIFETIME;
                
                // Store additional metadata about when the token was captured
                chrome.storage.local.set({
                    authToken: authToken,
                    authTokenCaptureTime: currentTime,
                    authTokenSource: details.url,
                    tokenExpirationTime: tokenExpirationTime
                });
                
                console.log(`[Auth] New token captured from ${details.url.substring(0, 40)}...`); 
            }
        }
    },
    {
        urls: ["*://botc.app/*", "*://api.botc.app/*", "*://chat-us1.botc.app/*", "*://chat-us2.botc.app/*"],
        types: ["xmlhttprequest", "main_frame", "sub_frame"]
    },
    ["requestHeaders"]
);