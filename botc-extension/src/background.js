// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVk_kuvYQ_JH700jKXrdSpOtcd3DFC9Rs", 
  authDomain: "botctracker.firebaseapp.com",
  projectId: "botctracker",
  storageBucket: "botctracker.appspot.com", 
  messagingSenderId: "234038964353",
  appId: "1:234038964353:web:94c42aa23b68e003fd9d80",
  measurementId: "G-C4FLY32JKZ"
};

// Firebase Global Variables
let firebaseApp = null;
let auth = null;
let db = null;
let firebaseUserId = null;
let isFirebaseInitialized = false; 
let currentFirebaseUser = null; // Store the current user object

// --- Firebase Initialization and Auth State Listener ---
function initializeFirebaseAndListen() {
    if (isFirebaseInitialized) return;
    isFirebaseInitialized = true;

    console.log('[BG Firebase] Initializing Firebase...');
    try {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);

        // Listener for authentication state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in (either anonymous or Google)
                currentFirebaseUser = user; // Store user object
                firebaseUserId = user.uid; // Update global UID
                console.log(`[BG Firebase Auth] State Changed: User signed in. UID: ${firebaseUserId}, Anonymous: ${user.isAnonymous}, Email: ${user.email}`);

                // Ensure document exists and load data ONLY if it's NOT an anonymous user
                if (!user.isAnonymous) {
                    await ensureUserDocumentExists();
                    await syncPlayerData(); // Trigger data synchronization after sign-in
                    // Load data after ensuring sync is attempted
                    // await loadPlayerDataFromFirebase(); // loadPlayerDataFromFirebase is called within syncPlayerData
                    // TODO: Notify popup about auth state change (maybe send synced data?)
                    notifyPopupAuthStateChange(user); 
                } else {
                    console.log('[BG Firebase Auth] Anonymous user detected, skipping Firestore document check and load.');
                }

                // Optional: If user was anonymous and now signed in with Google, 
                // Firebase might automatically link. If not, logic to migrate data could go here.
                // For now, we assume automatic linking or separate data silos per UID.

            } else {
                // User is signed out
                console.log('[BG Firebase Auth] State Changed: User signed out.');
                currentFirebaseUser = null;
                firebaseUserId = null;
                // Optionally, sign in anonymously again if you always want *some* user context
                // signInAnonymouslyIfNeeded(); // REMOVED - No automatic anonymous sign-in
            }
            // Notify popup about auth state change (implementation needed later)
            notifyPopupAuthStateChange(); 
        });

        // Initial sign-in attempt (anonymous if no user is logged in)
        // REMOVED - No initial sign-in attempt. User must explicitly sign in.
        // if (!auth.currentUser) {
        //      signInAnonymouslyIfNeeded();
        // }

    } catch (error) {
        console.error('[BG Firebase] Firebase initialization/auth listener setup failed:', error);
        isFirebaseInitialized = false; // Reset flag on major error
    }
}

// --- Sign-in / Sign-out Functions ---

// REMOVED - No longer needed
// async function signInAnonymouslyIfNeeded() { ... }

// REMOVED - This will be triggered from the popup now
// async function signInWithGoogle() { ... }

async function signOutFirebase() {
    if (!auth) {
        console.error('[BG Firebase] Firebase Auth not initialized.');
        return { success: false, error: 'Firebase not ready.' };
    }
    try {
        console.log('[BG Firebase] Signing out...');
        await signOut(auth);
        // onAuthStateChanged will detect the sign-out state.
        console.log('[BG Firebase] Sign-out successful.');
        // Optionally trigger anonymous sign-in again after sign-out if needed
        // signInAnonymouslyIfNeeded();
        return { success: true };
    } catch (error) {
        console.error('[BG Firebase] Sign-out failed:', error);
        return { success: false, error: error.message };
    }
}

// Helper to notify popup (implement later with messaging)
function notifyPopupAuthStateChange() {
    console.log('[BG Firebase] TODO: Notify popup about auth state change');
    // Example: chrome.runtime.sendMessage({ type: 'AUTH_STATE_CHANGED', user: currentFirebaseUser ? { uid: currentFirebaseUser.uid, email: currentFirebaseUser.email, isAnonymous: currentFirebaseUser.isAnonymous } : null });
    chrome.runtime.sendMessage({ 
        type: 'AUTH_STATE_CHANGED', 
        user: currentFirebaseUser ? { 
            uid: currentFirebaseUser.uid, 
            email: currentFirebaseUser.email, 
            isAnonymous: currentFirebaseUser.isAnonymous 
        } : null 
    }).catch(error => {
        // Ignore errors if the popup isn't open to receive the message
        if (error.message.includes('Receiving end does not exist') || error.message.includes('Could not establish connection')) {
            // console.log('[BG Notify] Popup not open, ignoring message send error.');
        } else {
            console.error('[BG Notify] Error sending auth state to popup:', error);
        }
    });
}

// --- Data Sync Functions (Ensure they use current firebaseUserId) ---

// Ensure User Document Exists in Firestore
async function ensureUserDocumentExists() {
    // Add check for non-anonymous user
    if (!db || !firebaseUserId || !currentFirebaseUser || currentFirebaseUser.isAnonymous) {
        console.error('[BG Firebase EnsureDoc] Cannot ensure document: Firebase not ready, no user ID, or user is anonymous.');
        return; // Exit if Firebase isn't ready or no user ID or user is anonymous
    }
    console.log(`[BG Firebase EnsureDoc] Ensuring document exists for user ${firebaseUserId}...`);
    try {
        const userDocRef = doc(db, "userPlayerData", firebaseUserId);
        // Use set with merge: true to create doc if !exists, or do nothing if exists.
        // We store an empty object initially, playerData gets added later.
        await setDoc(userDocRef, {}, { merge: true }); 
        console.log(`[BG Firebase EnsureDoc] Document existence ensured for user ${firebaseUserId}.`);
    } catch (error) {
        console.error(`[BG Firebase EnsureDoc] Error ensuring document for user ${firebaseUserId}:`, error);
    }
}

// Load Player Data from Firebase
async function loadPlayerDataFromFirebase() {
    if (!db || !firebaseUserId) {
        console.warn('[BG Firebase Load] Firestore not ready or no user ID. Cannot load.');
        return null; // Return null if we can't load
    }

    console.log(`[BG Firebase Load] Attempting to load data for user ${firebaseUserId}...`);
    const userDocRef = doc(db, 'userPlayerData', firebaseUserId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            console.log(`[BG Firebase Load] Data found in Firestore. Timestamp: ${firestoreData.lastUpdated}`);
            // Return the entire wrapped object
            return firestoreData; 
        } else {
            console.log(`[BG Firebase Load] No document found in Firestore for user ${firebaseUserId}.`);
            return null; // Return null if document doesn't exist
        }
    } catch (error) {
        console.error(`[BG Firebase Load] Error loading data from Firestore for user ${firebaseUserId}:`, error);
        return null; // Return null on error
    }
}

// Save Player Data to Firebase
async function savePlayerDataToFirebase(dataToSave) {
    if (!firebaseUserId) {
        console.warn('[BG Firebase Save] No user ID available, cannot save to Firestore.');
        return; // Cannot save without a user ID
    }
    if (!dataToSave || !dataToSave.playerData || dataToSave.lastUpdated === undefined) {
        console.warn('[BG Firebase Save] Invalid data structure received for saving. Aborting.', dataToSave);
        return;
    }

    console.log(`[BG Firebase Save] Saving data to Firestore for user ${firebaseUserId}. Timestamp: ${dataToSave.lastUpdated}`);
    const userDocRef = doc(db, 'userPlayerData', firebaseUserId);
    try {
        // Save the entire wrapped object { lastUpdated: ..., playerData: ... }
        await setDoc(userDocRef, dataToSave, { merge: true }); 
        console.log(`[BG Firebase Save] Data successfully saved to Firestore for user ${firebaseUserId}.`);
    } catch (error) {
        console.error(`[BG Firebase Save] Error saving data to Firestore for user ${firebaseUserId}:`, error);
        // Optional: Consider notifying the popup of the failure
    }
}

// --- Sync Logic ---
async function syncPlayerData() {
    // ** FIX: Use the global firebaseUserId updated by the auth listener **
    if (!firebaseUserId) { 
        console.log('[BG Sync] No user ID, skipping sync.');
        return;
    }
    console.log(`[BG Sync] Starting player data sync for user ${firebaseUserId}...`);

    try {
        const localResult = await chrome.storage.local.get('botcPlayerData');
        const localData = localResult.botcPlayerData;
        const localTimestamp = localData?.lastUpdated || 0;
        console.log(`[BG Sync] Local data timestamp: ${localTimestamp}`);

        const firestoreData = await loadPlayerDataFromFirebase(); // Returns { lastUpdated: ..., playerData: ... } or null
        const firestoreTimestamp = firestoreData?.lastUpdated || 0;
        console.log(`[BG Sync] Firestore data timestamp: ${firestoreTimestamp}`);

        // ** FIX: Corrected Sync Logic **
        if (localTimestamp > firestoreTimestamp) {
            console.log('[BG Sync] Local data is newer. Uploading to Firestore.');
            await savePlayerDataToFirebase(localData); // Pass the whole wrapped object
            // Notify popup after successful upload
            chrome.runtime.sendMessage({ action: 'PLAYER_DATA_SYNCED', source: 'firestore_upload' });
        } else if (firestoreTimestamp > localTimestamp) {
            console.log('[BG Sync] Firestore data is newer. Updating local storage.');
            await chrome.storage.local.set({ botcPlayerData: firestoreData });
            // Notify popup after successful download
            chrome.runtime.sendMessage({ action: 'PLAYER_DATA_SYNCED', source: 'firestore_download', data: firestoreData });
        } else {
            // Timestamps match OR one is 0/undefined and the other matches (e.g., both 0 after initial install/clear)
            console.log('[BG Sync] Local and Firestore data timestamps match or no definitive newer version found. No sync needed.');
        }

    } catch (error) {
        console.error('[BG Sync] Error during player data sync:', error);
    }
    console.log('[BG Sync] Sync process completed.');
}

// --- End Data Sync Functions ---

// --- Global variable for live game info ---
let liveGameInfo = null;

// --- Initialize Firebase on background script startup
// initializeFirebaseAndAuth(); // OLD initialization
initializeFirebaseAndListen(); // NEW initialization with listener

// Initial check on startup
(async () => {
    await initializeFirebaseAndListen(); // Ensure Firebase is up
    if (firebaseUserId) { // Check if already logged in from a previous session
        console.log('[BG Init] User already logged in on startup. Triggering initial sync.');
        await syncPlayerData();
    }
})();

// --- Message Listener from Content Script or Popup ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log(`[BG Message] Received message:`, request, `from sender:`, sender);

    if (request.type === 'GET_AUTH_TOKEN') {
        console.log('[BG Auth] Received GET_AUTH_TOKEN request.');
        getAuthToken().then(token => {
            sendResponse({ token: token });
        });
        return true; // Indicate async response

    } else if (request.type === 'GET_PLAYER_DATA') {
        // console.log('[BG PlayerData] Received request for player data.');
        chrome.storage.local.get('botcPlayerData', (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG PlayerData] Error fetching player data:', chrome.runtime.lastError);
                sendResponse({ playerData: {}, error: chrome.runtime.lastError.message });
            } else {
                // console.log('[BG PlayerData] Sending player data:', result.botcPlayerData ? Object.keys(result.botcPlayerData).length + ' players' : '{}');
                sendResponse({ playerData: result.botcPlayerData || {} });
            }
        });
        return true; // Crucial: Indicate async response

    } else if (request.type === 'SAVE_PLAYER_DATA') {
        // console.log('[BG Save] Received request to save player data.');
        if (request.payload) {
            chrome.storage.local.set({ botcPlayerData: request.payload }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[BG Save] Error saving player data to local storage:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    // console.log("[BG Save] Player data saved locally via popup request (type: SAVE_PLAYER_DATA).");
                    sendResponse({ success: true }); // Send success response back immediately

                    // *** Now, trigger async save to Firebase ***
                    // (async () => {
                    //     try {
                    //         await savePlayerDataToFirebase(request.payload);
                    //         console.log('[BG Message] savePlayerDataToFirebase completed.');
                    //     } catch (error) {
                    //         console.error('[BG Message] Error during savePlayerDataToFirebase:', error);
                    //     }
                    // })();
                }
            });
            return true; // Indicate asynchronous response for storage set
        } else {
            console.error("[BG Save] Received SAVE_PLAYER_DATA request without payload.");
            sendResponse({ success: false, error: "Missing payload" });
        }

    } else if (request.action === 'fetchSessions') { // Handle request from popup
        console.log('[BG Popup Fetch] Received fetchSessions request from popup.');
        // ** FIX: Load auth token AND current player data before fetching **
        chrome.storage.local.get(['authToken', 'botcPlayerData'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG Popup Fetch] Error getting data from storage:', chrome.runtime.lastError);
                sendResponse({ error: 'Failed to load data before fetching sessions.' });
                return;
            }
            const authToken = result.authToken;
            const currentWrappedData = result.botcPlayerData; // This is the object { lastUpdated: ..., playerData: ... }
            
            if (!authToken) {
                console.warn('[BG Popup Fetch] Auth token not found in storage.');
                sendResponse({ error: 'Authentication token not found.' });
                return;
            }
            
            // Step 1: Run background processing (updates player data based on sessions)
            (async () => {
                try {
                    const result = await fetchAndProcessSessionsInBackground(); // Await the promise
                    // Check the result *before* logging completion status
                    if (result.success) {
                        console.log('[BG Popup Fetch] fetchAndProcessSessionsInBackground completed successfully.');
                        // Fetch the updated player data to send back
                        chrome.storage.local.get(['botcPlayerData', 'sessionDataCache'], (data) => {
                            if (chrome.runtime.lastError) {
                                console.error('[BG Popup Fetch] Error retrieving data after successful fetch:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: 'Failed to retrieve updated data' });
                            } else {
                                console.log('[BG Popup Fetch] Successfully fetched session list and player data for popup.'); // Log success here
                                console.log('[BG Popup Fetch] Sending sessionDataCache to popup:', data.sessionDataCache); // Log data being sent
                                sendResponse({ 
                                    success: true, 
                                    sessions: data.sessionDataCache || [], // Send cached sessions 
                                    players: data.botcPlayerData || { lastUpdated: 0, playerData: {} } 
                                });
                            }
                        });
                    } else {
                        // Use the error message provided by the fetch function
                        console.error('[BG Popup Fetch] fetchAndProcessSessionsInBackground failed:', result.error);
                        sendResponse({ success: false, error: result.error || 'Background fetch failed' }); 
                    }
                } catch (error) { // Catch synchronous errors *before* the await, or rejections not handled by returning {success: false}
                    console.error('[BG Popup Fetch] Error during FETCH_SESSIONS handling (outer catch):', error);
                    sendResponse({ success: false, error: error.message || 'Unknown error during fetch' });
                }
            })();
            return true; // Indicate async response
        });
        return true; // Indicate async response will be sent

    } else if (request.action === 'GET_AUTH_STATE') {
        console.log('[BG Auth] Received GET_AUTH_STATE request from popup.');
        sendResponse({ 
            type: 'AUTH_STATE_CHANGED', // Re-use the same type for consistency
            user: currentFirebaseUser ? { 
                uid: currentFirebaseUser.uid, 
                email: currentFirebaseUser.email, 
                isAnonymous: currentFirebaseUser.isAnonymous 
            } : null 
        });

    } else if (request.action === 'SIGN_OUT_FIREBASE') {
        console.log('[BG Auth] Received SIGN_OUT_FIREBASE request from popup.');
        signOutFirebase().then(sendResponse);
        return true; // Indicate async response

    } else if (request.type === 'CURRENT_GAME_INFO') { // Handler for info from content script
        // console.log('[BG Game Info] Received game info from content script:', request.payload);
        liveGameInfo = request.payload; // Update the stored game info
        // Maybe notify popup if it's open?
        // chrome.runtime.sendMessage({ type: 'GAME_INFO_UPDATED', payload: liveGameInfo });
        sendResponse({ success: true }); // Acknowledge receipt

    } else if (request.type === 'GET_CURRENT_GAME_INFO') { // Handler for popup requesting info
        // console.log('[BG Game Info Req] Popup requested current game info.');
        sendResponse({ gameInfo: liveGameInfo });

    } else if (request.action === 'SAVE_PLAYER_DATA') {
        console.log(`[BG Message] Received ${request.action} message from popup.`);
        // Expects payload to be { lastUpdated: ..., playerData: ... }
        const dataPayload = request.payload;
        // Wrap in async IIFE to use await correctly
        // (async () => {
        //     try {
        //         await savePlayerDataToFirebase(dataPayload);
        //         console.log('[BG Message] savePlayerDataToFirebase completed.');
        //     } catch (error) {
        //         console.error('[BG Message] Error during savePlayerDataToFirebase:', error);
        //     }
        // })();
        // Send response immediately, don't wait for Firebase save
        sendResponse({ status: 'received' }); 

    } else if (request.action === 'GET_PLAYER_DATA') {
        // This might need adjustment if popup expects unwrapped data
        chrome.storage.local.get('botcPlayerData', (data) => {
            if (chrome.runtime.lastError) {
                sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
            } else {
                // Send the wrapped data back, popup needs to handle it
                sendResponse({ status: 'success', payload: data.botcPlayerData });
            }
        });
        return true; // Indicate asynchronous response

    } else if (request.action === 'USER_SIGNED_IN') { // Handle message from popup after successful sign-in
        console.log('[BG Message] Received USER_SIGNED_IN from popup:', request.payload);
        // Potentially trigger sync here if needed, though sign-in state change handler might be better
        sendResponse({ status: 'acknowledged' });

    } else if (request.action === 'manualSync') {
        console.log('[BG Manual Sync] Received manualSync request.');
        (async () => { // Keep the async IIFE
            try {
                const result = await syncLocalAndFirebase(); // Call the new sync function
                sendResponse(result);
            } catch (error) {
                console.error('[BG Manual Sync] Error during manual sync:', error);
                sendResponse({ success: false, error: error.message || 'Unknown error during manual sync' });
            }
        })();
        return true; // Indicate async response will be sent

    } else {
        console.log('[BG Message] Received unknown message action:', request.action ? request.action : JSON.stringify(request));
        sendResponse({ status: 'error', message: 'Unknown action' });

    }

    // Important: Return true for *all* asynchronous message handlers
    // This keeps the message channel open until sendResponse is called.
    if ([
        'fetchSessions', // Handles fetchAndProcessSessionsInBackground
        'manualSync',    // Handles syncLocalAndFirebase
        'SIGN_IN_FIREBASE', // Handles signInWithEmail
        'SIGN_OUT_FIREBASE',// Handles signOutFirebase
        'SAVE_PLAYER_DATA', // Handles savePlayerDataToFirebase
        'GET_AUTH_TOKEN'   // Handles getAuthToken
        // Add any other async handlers here
    ].includes(request.action)) {
        return true;
    }
    // Otherwise, return false or undefined implicitly for synchronous responses
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

// --- Session Fetching and Processing ---
const SESSION_URL = 'https://botc.app/backend/sessions';

/**
 * Fetches sessions, processes player history, updates local storage, and syncs with Firebase.
 * Now fetches its own required data (token, local player data) internally.
 * @returns {Promise<Object>} A promise resolving to { success: true } or { success: false, error: '...' }
 */
async function fetchAndProcessSessionsInBackground() {
    console.log('[BG Local Fetch] Starting background session fetch for local update...'); // Renamed log slightly

    // 1. Load required data (token, local player data)
    let authToken = null;
    let currentWrappedData = null;
    try {
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['authToken', 'botcPlayerData'], (data) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(data);
                }
            });
        });
        authToken = result.authToken;
        currentWrappedData = result.botcPlayerData || { lastUpdated: 0, playerData: {} }; // Default if not present
        // console.log(`[BG Local Fetch] Loaded auth token (present: ${!!authToken}), player data (lastUpdated: ${currentWrappedData.lastUpdated})`); // Less verbose log
    } catch (error) {
        console.error('[BG Local Fetch] Error loading data from storage:', error);
        return { success: false, error: 'Failed to load data from storage' };
    }

    // 1. Check for auth token
    if (!authToken) {
        console.warn('[BG Local Fetch] No auth token found. Cannot fetch sessions.');
        return { success: false, error: 'No auth token found' };
    }

    // Log the token being used (masked)
    const maskedToken = authToken ? `${authToken.substring(0, 10)}...${authToken.substring(authToken.length - 5)}` : 'null';
    console.log(`[BG Local Fetch] Attempting fetch with token: ${maskedToken}`);

    // 2. Fetch session data
    try {
        const response = await fetch(SESSION_URL, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // Attempt to parse JSON
        let sessionsData;
        try {
            // Clone the response to allow reading body multiple times if needed (e.g., for error logging)
            const responseClone = response.clone(); 
            sessionsData = await responseClone.json();
            console.log('[BG Local Fetch] Successfully parsed JSON sessionsData:', sessionsData); // Log fetched data
            // Cache the fetched sessions if successful
            await chrome.storage.local.set({ sessionDataCache: sessionsData || [] }); // Cache the direct array
        } catch (jsonError) {
            // Handle JSON parsing error - likely means HTML response
            console.error(`[BG Local Fetch] Failed to parse JSON response. Error:`, jsonError);
            try {
                // Clone the response before reading text, as body can only be read once
                const errorText = await response.clone().text(); 
                console.error(`[BG Local Fetch] Server returned non-JSON content (Status: ${response.status}):`, errorText.substring(0, 500) + (errorText.length > 500 ? '...' : '')); // Log beginning of HTML
                return { success: false, error: `Server returned non-JSON content (Status: ${response.status}). Check logs for details.` };
            } catch (textError) {
                console.error('[BG Local Fetch] Could not read response body as text either:', textError);
                return { success: false, error: `Failed to parse response (Status: ${response.status}). Check network tab.` };
            }
        }

        // Check for non-OK responses AFTER attempting to parse (in case error is JSON)
        if (!response.ok) {
             console.error(`[BG Local Fetch] API Error ${response.status}. Response logged above if non-JSON.`);
             // Use the parsed JSON error if available, otherwise generic status
             const errorMessage = sessionsData?.message || `HTTP error ${response.status}`; 
             return { success: false, error: `API Error ${response.status}: ${errorMessage}` }; 
        }

        if (sessionsData && Array.isArray(sessionsData)) { 
            console.log(`[BG Local Fetch] Processing ${sessionsData.length} fetched sessions...`);
            // ... existing player data processing logic ...
            sessionsData.forEach(session => {
                 if (!session || typeof session !== 'object') {
                     console.warn('[BG Local Fetch] Skipping invalid session entry:', session);
                     return; // Skip malformed session objects
                 }
                 const currentSessionIdentifier = session.name ? session.name.toString() : null;
                 if (session.usersAll && Array.isArray(session.usersAll)) {
                     session.usersAll.forEach(userInSession => {
                         const userId = userInSession.id ? userInSession.id.toString() : null;
                         const userNameFromApi = userInSession.username ? userInSession.username.trim() : null;

                         // ** FIX: Access workingPlayerData **
                         if (userId && currentWrappedData.playerData[userId]) {
                             const player = currentWrappedData.playerData[userId];
                             let playerActivityUpdatedThisCycle = false;

                             // Username update logic
                             if (userNameFromApi && player.name !== userNameFromApi) {
                                 const oldUsername = player.name;
                                 player.name = userNameFromApi;
                                 if (!player.usernameHistory) player.usernameHistory = [];
                                 const lastHistoryEntry = player.usernameHistory.length > 0 ? player.usernameHistory[0].username : null;
                                 if (oldUsername && (!lastHistoryEntry || lastHistoryEntry.toLowerCase() !== oldUsername.toLowerCase())) {
                                     player.usernameHistory.unshift({ username: oldUsername, timestamp: Date.now() });
                                     console.log(`[BG Local Fetch] Username change for ID ${userId}: '${oldUsername}' -> '${userNameFromApi}'. History updated.`);
                                 }
                                 playerActivityUpdatedThisCycle = true;
                             }

                             // Update last seen timestamp
                             const now = Date.now();
                             if (Math.abs(now - (player.lastSeenTimestamp || 0)) > 1000) { // Update roughly every second
                                 player.lastSeenTimestamp = now;
                                 playerActivityUpdatedThisCycle = true;
                             }

                             // Update session history
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
                             }
                             
                             if (playerActivityUpdatedThisCycle) {
                                 // Mark that we need to save
                             }
                         }
                     });
                 }
            });
        } else {
            console.warn('[BG Local Fetch] sessionsData is not an array or is null/undefined. Skipping processing.', sessionsData);
        }

        // --- Save ONLY to local storage IF changes were made --- START
        if (currentWrappedData.playerData) {
            console.log('[BG Local Fetch] Local player data changes detected, saving locally...');
            const updatedWrappedData = {
                lastUpdated: Date.now(),
                playerData: currentWrappedData.playerData // Save the modified data
            };
            await chrome.storage.local.set({ botcPlayerData: updatedWrappedData });
            console.log('[BG Local Fetch] Local data saved.');
        } else {
            // console.log('[BG Local Fetch] No local player data changes detected.'); // Optional log
        }
        // --- Save ONLY to local storage IF changes were made --- END

    } catch (error) {
        console.error('[BG Local Fetch] Error during background fetch/process:', error);
        return { success: false, error: error.message || 'Unknown error during background fetch/process' };
    }

    return { success: true }; // Return success if all steps completed without throwing
}

// Helper to merge data (simplified, assumes server data is potentially newer)
// Returns true if changes were made to local data, false otherwise
function mergeAndTrackChanges(serverData, localData) {
    // TO DO: Implement merge logic
    console.warn('[BG Merge] mergeAndTrackChanges function not implemented.');
    return false;
}

// --- Firebase Sync Logic (Triggered Manually) --- START
async function syncLocalAndFirebase() {
    console.log('[BG Sync] Starting manual sync between local storage and Firebase...');

    if (!db || !firebaseUserId || !currentFirebaseUser || currentFirebaseUser.isAnonymous) {
        console.warn('[BG Sync] Cannot sync: Firebase not ready, no user ID, or user is anonymous.');
        return { success: false, status: 'error', error: 'Firebase not connected or user not logged in (non-anonymously).' };
    }

    let localData = null;
    let firebaseData = null;

    // 1. Load data from both sources
    try {
        const localResult = await chrome.storage.local.get('botcPlayerData');
        localData = localResult.botcPlayerData; // Might be undefined
        console.log(`[BG Sync] Local data loaded. lastUpdated: ${localData?.lastUpdated}`);
    } catch (error) {
        console.error('[BG Sync] Error loading local data:', error);
        return { success: false, status: 'error', error: 'Failed to load local data.' };
    }

    try {
        firebaseData = await loadPlayerDataFromFirebase(); // Handles its own null checks
        console.log(`[BG Sync] Firebase data loaded. lastUpdated: ${firebaseData?.lastUpdated}`);
    } catch (error) {
        // loadPlayerDataFromFirebase logs its own errors
        return { success: false, status: 'error', error: 'Failed to load Firebase data.' };
    }

    // 2. Compare and Sync
    const localTimestamp = localData?.lastUpdated ?? 0;
    const firebaseTimestamp = firebaseData?.lastUpdated ?? 0;

    try {
        if (!localData && firebaseData) {
            // No local data, but Firebase data exists -> Sync down
            console.log('[BG Sync] No local data, syncing from Firebase...');
            await chrome.storage.local.set({ botcPlayerData: firebaseData });
            return { success: true, status: 'synced_down', message: 'Synced data from cloud.' };
        } else if (localData && !firebaseData) {
            // Local data exists, but no Firebase data -> Sync up
            console.log('[BG Sync] No Firebase data, syncing local to Firebase...');
            await savePlayerDataToFirebase(localData);
            return { success: true, status: 'synced_up', message: 'Synced local data to cloud.' };
        } else if (!localData && !firebaseData) {
             // Neither exists
            console.log('[BG Sync] No data found locally or in Firebase.');
            return { success: true, status: 'no_data', message: 'No data to sync.' };
        } else if (localTimestamp > firebaseTimestamp) {
            // Local is newer -> Sync up
            console.log('[BG Sync] Local data is newer, syncing to Firebase...');
            await savePlayerDataToFirebase(localData);
            return { success: true, status: 'synced_up', message: 'Synced local data to cloud.' };
        } else if (firebaseTimestamp > localTimestamp) {
            // Firebase is newer -> Sync down
            console.log('[BG Sync] Firebase data is newer, syncing to local...');
            await chrome.storage.local.set({ botcPlayerData: firebaseData });
            return { success: true, status: 'synced_down', message: 'Synced data from cloud.' };
        } else {
            // Timestamps are equal (or both 0)
            console.log('[BG Sync] Local and Firebase data are already in sync.');
            return { success: true, status: 'no_change', message: 'Data already in sync.' };
        }
    } catch (error) {
        console.error('[BG Sync] Error during sync operation (save/load):', error);
        return { success: false, status: 'error', error: `Sync failed: ${error.message}` };
    }
}
// --- Firebase Sync Logic (Triggered Manually) --- END

// Helper function to log stored data (for debugging)
function logStoredData() {
    chrome.storage.local.get(null, (items) => {
        console.log('[BG Storage] Stored data:', items);
    });
}

// --- Alarms and Periodic Tasks --- VVV RESTORED VVV
// /*
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed/updated");
    chrome.alarms.clear('fetchBotcSessionsAlarm', (wasCleared) => {
        if (wasCleared) {
            console.log('[BG Alarm] Cleared old alarm: fetchBotcSessionsAlarm');
        } else {
            // This might happen if the alarm didn't exist, which is fine.
            // console.log('[BG Alarm] Old alarm fetchBotcSessionsAlarm not found or already cleared.');
        }
    });
    setupSessionFetchAlarm(); // Setup alarm on install
    initializeFirebaseAndListen(); // Initialize Firebase on install/update

    // Optional: Clean up old alarms if names change
    // chrome.alarms.clearAll(); // Clear all alarms

    // syncPlayerData(); // Sync with Firebase if logged in
    // handleBackgroundFetchTrigger(); // Fetch initial session data? Maybe too soon.
});
// */

chrome.runtime.onStartup.addListener(() => {
    console.log("Extension started");
    setupSessionFetchAlarm(); // Ensure alarm exists on startup
    initializeFirebaseAndListen(); // Initialize Firebase on startup
    // handleBackgroundFetchTrigger(); // Fetch session data on startup
});

// Function to setup the alarm for fetching session data
const FETCH_ALARM_NAME = 'botc-local-update-alarm'; // Changed name slightly
const FETCH_INTERVAL_MINUTES = 1; // Fetch every 1 minute as requested

function setupSessionFetchAlarm() {
    console.log(`[BG Alarm] Setting up fetch alarm: ${FETCH_ALARM_NAME}, Interval: ${FETCH_INTERVAL_MINUTES} minutes`);
    chrome.alarms.get(FETCH_ALARM_NAME, (existingAlarm) => {
        if (!existingAlarm) {
            chrome.alarms.create(FETCH_ALARM_NAME, {
                // delayInMinutes: 1, // Initial delay before first fetch
                periodInMinutes: FETCH_INTERVAL_MINUTES // Fetch every X minutes
            });
        }
    });
}

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === FETCH_ALARM_NAME) {
        console.log(`[BG_ALARM] Alarm triggered: ${FETCH_ALARM_NAME}`);
        // Fetch the latest session data in the background
        fetchAndProcessSessionsInBackground().catch(error => {
            console.error(`[BG_ALARM] Error during alarm-triggered background fetch:`, error);
        }); 
    } else {
        console.log(`[BG_ALARM] Unknown alarm triggered: ${alarm.name}`);
        chrome.alarms.clear(alarm.name, (wasCleared) => {
            if (wasCleared) {
                console.log(`[BG_ALARM] Cleared unknown alarm: ${alarm.name}`);
            } else {
                console.warn(`[BG_ALARM] Failed to clear unknown alarm: ${alarm.name}`);
            }
        });
    }
});
// --- Alarms and Periodic Tasks --- ^^^ RESTORED ^^^

// Listen for network requests to extract the Authorization token
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const authHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "authorization");
        // Just save the raw header value found
        if (authHeader && authHeader.value) { 
            // console.log('[BG Token] Saving raw captured Auth token:', authHeader.value ? '********' : 'null'); // Mask token
            chrome.storage.local.set({ authToken: authHeader.value }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[BG Token] Error saving auth token:', chrome.runtime.lastError);
                } else {
                    // console.log("Authorization token extracted and stored.");
                }
            });
        }
    },
    {
        urls: ["*://botc.app/*"], // Only intercept requests to botc.app domains
        types: ["xmlhttprequest", "main_frame", "sub_frame"] // Capture AJAX and page loads
    },
    ["requestHeaders"] // Need this permission to read headers
);