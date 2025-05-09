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
                    console.log("Authorization token extracted and stored.");
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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "requestSession" || request.action === "fetchSessions") { 
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
    } else if (request.action === "getPlayerData") {
        chrome.storage.local.get('playerData', (data) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ playerData: data.playerData || {} });
            }
        });
        return true; // Keep the channel open for the asynchronous response
    }
    // Removed 'storeAuthToken' handler as it's unused
    return false; // Default for synchronous messages or if no handler matches
});

let activeGameUserIds = new Set();

function extractUserIdsFromPayload(data, foundIds) {
    if (!data) return;

    if (Array.isArray(data)) {
        data.forEach(item => extractUserIdsFromPayload(item, foundIds));
    } else if (typeof data === 'object' && data !== null) {
        // Check for common ID keys
        const commonIdKeys = ['id', 'userId', 'userID', 'playerId', 'playerID', 'senderId', 'accountId'];
        for (const key of commonIdKeys) {
            if (data.hasOwnProperty(key) && (typeof data[key] === 'string' || typeof data[key] === 'number')) {
                if (String(data[key]).length > 2 && String(data[key]).length < 50) { // Basic sanity check for ID format
                    foundIds.add(String(data[key]));
                }
            }
        }
        // Recursively check other properties that might be objects or arrays
        for (const key in data) {
            if (data.hasOwnProperty(key) && !commonIdKeys.includes(key)) { // Avoid re-processing already checked keys
                extractUserIdsFromPayload(data[key], foundIds);
            }
        }
    } else if (typeof data === 'string' || typeof data === 'number') {
        // If the payload itself is a simple string/number, it might be an ID in some contexts
        // This is less reliable and should be used cautiously or with more context
        // For now, we are focusing on structured data. We can add heuristics later if needed.
    }
}

function processWebSocketPayloadForUserIds(payload, messageType) { 
    const newlyFoundIds = new Set();

    // Special handling for Socket.IO chat messages which arrive as ["event_name", data_object]
    if ((messageType === 'CHAT_DATA' || messageType === 'CHAT_DATA_RAW') && 
        Array.isArray(payload) && 
        payload.length === 2 && 
        typeof payload[0] === 'string' && 
        typeof payload[1] === 'object' && payload[1] !== null) {
        extractUserIdsFromPayload(payload[1], newlyFoundIds); // Process the actual data object
    } else {
        extractUserIdsFromPayload(payload, newlyFoundIds);
    }

    if (newlyFoundIds.size > 0) {
        console.log("Extracting User IDs - Before this payload:", new Set(activeGameUserIds)); // Log current state before adding
        newlyFoundIds.forEach(id => activeGameUserIds.add(id));
        console.log("Extracting User IDs - After adding new from this payload:", activeGameUserIds);
        console.log("Extracting User IDs - IDs found in THIS payload:", newlyFoundIds);
    }
    return newlyFoundIds; // Return only the IDs found in *this* payload
}

// Listen for messages from the content script or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log("Background script received message:", message, "from sender:", sender); // Already have a good log for this.

  if (message.source === 'content_script') {
    console.log(`Received message from content_script: Type: ${message.type}, URL: ${message.url}`);
    console.log("Full payload from content_script:", JSON.stringify(message.payload, null, 2)); // TEMPORARILY UNCOMMENT FOR DEBUGGING

    switch (message.type) {
      case 'GAME_DATA':
      case 'GAME_DATA_RAW': // Assuming raw data might also be structured or become structured
        console.log("Processing User IDs for", message.type);
        const gameUserIds = processWebSocketPayloadForUserIds(message.payload, message.type);
        // console.log("Extracted User IDs from", message.type + ":", gameUserIds); // Covered by logging within processWebSocketPayloadForUserIds
        sendResponse({ status: "GAME_DATA received", processed_ids: Array.from(gameUserIds) });
        break;
      case 'CHAT_DATA':
      case 'CHAT_DATA_RAW':
        console.log("Processing User IDs for", message.type);
        const chatUserIds = processWebSocketPayloadForUserIds(message.payload, message.type);
        // console.log("Extracted User IDs from", message.type + ":", chatUserIds); // Covered by logging within processWebSocketPayloadForUserIds
        sendResponse({ status: "CHAT_DATA received", processed_ids: Array.from(chatUserIds) });
        break;
      default:
        console.warn("Received unknown message type from content_script:", message.type);
    }

    sendResponse({ status: "success", message: "Data received by background script" });
    return true; 
  }
  return true; 
});

console.log("Background script loaded and listener is active. User ID extraction enabled.");