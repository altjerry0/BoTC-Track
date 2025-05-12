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
                    console.error('[BG Save] Error saving player data:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    // console.log("[BG Save] Player data saved via popup request (type: SAVE_PLAYER_DATA).");
                    sendResponse({ success: true });
                }
            });
            return true; // Indicate asynchronous response for storage set
        } else {
            console.error("[BG Save] Received SAVE_PLAYER_DATA request without payload.");
            sendResponse({ success: false, error: "Missing payload" });
        }

    } else if (request.type === 'CURRENT_GAME_INFO') { // Handler for info from content script
        // console.log('[BG Game Info] Received game info from content script:', request.payload);
        liveGameInfo = request.payload; // Update the stored game info
        // Notify popup (if open) that live game info has been updated
        chrome.runtime.sendMessage({ type: 'LIVE_GAME_INFO_UPDATED', payload: liveGameInfo }, response => {
            if (chrome.runtime.lastError) {
                // This error is expected if the popup is not open, so we don't need to log it aggressively.
                // console.warn("[BG Game Info] Error sending LIVE_GAME_INFO_UPDATED (popup might be closed):", chrome.runtime.lastError.message);
            }
        });
        sendResponse({ status: "Live game info received by background." });
        return true; // Indicate async response

    } else if (request.type === 'GET_CURRENT_GAME_INFO') { // Handler for requests from popup
        // console.log('[BG Game Info] Popup requested live game info. Sending:', liveGameInfo);
        sendResponse({ gameInfo: liveGameInfo });
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
        types: ["xmlhttprequest", "main_frame", "sub_frame"] // Added main_frame and sub_frame for broader capture if needed initially.
    },
    ["requestHeaders"]
);