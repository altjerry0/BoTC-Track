// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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

// --- Firebase Initialization and Auth Function ---
async function initializeFirebaseAndAuth() {
    if (isFirebaseInitialized) return;
    isFirebaseInitialized = true; 

    console.log('[BG Firebase] Initializing Firebase...');
    try {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);

        console.log('[BG Firebase] Signing in anonymously...');
        const userCredential = await signInAnonymously(auth);
        firebaseUserId = userCredential.user.uid;
        console.log('[BG Firebase] Signed in with Firebase UID:', firebaseUserId);

        // Ensure the user's document exists before trying to load data
        await ensureUserDocumentExists();

        // Load data from Firebase after successful sign-in
        await loadPlayerDataFromFirebase();

    } catch (error) {
        console.error('[BG Firebase] Firebase initialization/auth failed:', error);
        // Reset flag if initialization failed significantly
        isFirebaseInitialized = false;
    }
}

// --- Ensure User Document Exists ---
async function ensureUserDocumentExists() {
    if (!firebaseUserId || !db) {
        console.error('[BG Firebase EnsureDoc] Cannot ensure document: Firebase not ready or no user ID.');
        return;
    }

    console.log(`[BG Firebase EnsureDoc] Ensuring document exists for user ${firebaseUserId}...`);
    const docRef = doc(db, 'userPlayerData', firebaseUserId);

    try {
        // Use set with merge:true. Creates the doc if it doesn't exist,
        // or harmlessly merges {} into it if it does.
        await setDoc(docRef, {}, { merge: true });
        console.log(`[BG Firebase EnsureDoc] Document existence ensured for user ${firebaseUserId}.`);
    } catch (error) {
        // This write should generally be allowed by the rules, but log if it fails.
        console.error('[BG Firebase EnsureDoc] Error ensuring user document exists:', error);
    }
}

// --- Firestore Load Function ---
async function loadPlayerDataFromFirebase() {
    if (!firebaseUserId || !db) {
        console.error('[BG Firebase Load] Cannot load data: Firebase not ready or no user ID.');
        return;
    }

    console.log(`[BG Firebase Load] Attempting to load data for user ${firebaseUserId}...`);
    const docRef = doc(db, 'userPlayerData', firebaseUserId);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const firebaseData = docSnap.data();
            console.log('[BG Firebase Load] Data found in Firestore:', firebaseData);
            if (firebaseData && firebaseData.playerData) {
                // Here you might add logic to merge or compare timestamps later.
                // For now, overwrite local storage if Firebase has data.
                chrome.storage.local.set({ playerData: firebaseData.playerData }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('[BG Firebase Load] Error saving fetched data to local storage:', chrome.runtime.lastError);
                    } else {
                        console.log('[BG Firebase Load] Local storage updated with data from Firestore.');
                    }
                });
            } else {
                console.log('[BG Firebase Load] Firestore document exists but has no playerData field.');
            }
        } else {
            console.log('[BG Firebase Load] No player data found in Firestore for this user. Local data will be kept or synced up later.');
            // Optional: If local data exists, maybe trigger an initial save to Firebase here?
            // Consider saving existing local data UP to firebase if it doesn't exist there.
            chrome.storage.local.get('playerData', (result) => {
                if (!chrome.runtime.lastError && result.playerData && Object.keys(result.playerData).length > 0) {
                    console.log('[BG Firebase Load] Existing local data found. Triggering initial sync to Firestore.');
                    savePlayerDataToFirebase(result.playerData); // Save local data up to Firebase
                }
            });
        }
    } catch (error) {
        console.error('[BG Firebase Load] Error getting document:', error);
    }
}

// --- Firestore Save Function ---
async function savePlayerDataToFirebase(playerData) {
    if (!firebaseUserId || !db) {
        console.error('[BG Firebase Save] Cannot save data: Firebase not ready or no user ID.');
        return;
    }
    if (!playerData) {
        console.warn('[BG Firebase Save] Attempted to save null/undefined playerData. Skipping.');
        return;
    }

    console.log(`[BG Firebase Save] Saving data to Firestore for user ${firebaseUserId}...`);
    const docRef = doc(db, 'userPlayerData', firebaseUserId);

    try {
        // We store the entire playerData object under a key 'playerData' within the user's document
        await setDoc(docRef, { playerData: playerData }, { merge: true }); // Use merge to avoid overwriting other potential fields later
        console.log('[BG Firebase Save] Player data successfully saved to Firestore.');
    } catch (error) {
        console.error('[BG Firebase Save] Error saving data to Firestore:', error);
    }
}

// --- Global variable for live game info ---
let liveGameInfo = null;

// --- Initialize Firebase on Startup ---
initializeFirebaseAndAuth();

// --- Message Listener from Content Script or Popup ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
                    console.error('[BG Save] Error saving player data to local storage:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    // console.log("[BG Save] Player data saved locally via popup request (type: SAVE_PLAYER_DATA).");
                    sendResponse({ success: true }); // Send success response back immediately

                    // *** Now, trigger async save to Firebase ***
                    savePlayerDataToFirebase(request.payload);
                }
            });
            return true; // Indicate asynchronous response for storage set
        } else {
            console.error("[BG Save] Received SAVE_PLAYER_DATA request without payload.");
            sendResponse({ success: false, error: "Missing payload" });
        }

    } else if (request.action === 'fetchSessions') { // Handle request from popup
        console.log('[BG Popup Fetch] Received fetchSessions request from popup.');
        chrome.storage.local.get('authToken', (result) => {
            const currentAuthToken = result.authToken;
            if (!currentAuthToken) {
                console.warn("[BG Popup Fetch] Auth token missing for session fetch.");
                sendResponse({ error: "Authorization token not available" });
                return;
            }

            fetch("https://botc.app/backend/sessions", {
                method: "GET",
                headers: { "Authorization": currentAuthToken }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                        .then(errorBody => {
                            const errorMessage = errorBody.message || response.statusText;
                            throw new Error(`API Error ${response.status}: ${errorMessage}`);
                        });
                }
                return response.json();
            })
            .then(sessionsData => {
                if (sessionsData && typeof sessionsData.error !== 'undefined') {
                    console.error("[BG Popup Fetch] API returned 200 OK but with an error:", sessionsData.error);
                    sendResponse({ error: sessionsData.error });
                } else {
                    // console.log('[BG Popup Fetch] Sending sessions data to popup:', sessionsData);
                    sendResponse({ sessions: sessionsData });
                }
            })
            .catch(error => {
                console.error("[BG Popup Fetch] Error fetching sessions for popup:", error);
                sendResponse({ error: error.message || "Failed to fetch sessions." });
            });
        });
        return true; // Crucial: Indicate async response

    } else if (request.type === 'CURRENT_GAME_INFO') { // Handler for info from content script
        // console.log('[BG Game Info] Received game info from content script:', request.payload);
        liveGameInfo = request.payload; // Update the stored game info
        // Maybe notify popup if it's open?
        // chrome.runtime.sendMessage({ type: 'GAME_INFO_UPDATED', payload: liveGameInfo });
        sendResponse({ success: true }); // Acknowledge receipt
        // No return true needed as response is synchronous here

    } else if (request.type === 'GET_CURRENT_GAME_INFO') { // Handler for popup requesting info
        // console.log('[BG Game Info Req] Popup requested current game info.');
        sendResponse({ gameInfo: liveGameInfo });
        // No return true needed

    } else {
        console.log('[BG Message] Received unknown message type:', request.type ? request.type : JSON.stringify(request));
        // Optional: sendResponse({ error: 'Unknown message type' });
    }

    // Return false if no async operation is pending for this message type
    // (If we reached here and didn't return true earlier)
    // Note: This is tricky with mixed sync/async handlers. The `return true` in specific
    // async branches is the more reliable pattern.
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
        chrome.tabs.query({ url: "*://botc.app/*", status: "complete" }, (tabs) => { 
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
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const authHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "authorization");
        if (authHeader && authHeader.value.startsWith("Bearer ")) {
            const newAuthToken = authHeader.value;
            if (authToken !== newAuthToken) { // Only update if it changed
                authToken = newAuthToken;
                // Save to local storage for the alarm to use
                chrome.storage.local.set({ authToken: authToken }, () => {
                    // console.log("Authorization token extracted and stored.");
                });
            }
        }
    },
    {
        urls: ["*://botc.app/*"],
        types: ["xmlhttprequest", "main_frame", "sub_frame"] 
    },
    ["requestHeaders"]
);