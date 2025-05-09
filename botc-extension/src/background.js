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

// Consolidated listener for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`%c[BG] Received message:`, 'color: #FFD700', message, 'from sender:', sender.tab ? `tab ${sender.tab.id}` : "extension context", sender.url || (sender.id === chrome.runtime.id ? '(self)' : sender.id));

    // Messages typically from popup (using message.action)
    if (message.action === "requestSession" || message.action === "fetchSessions") {
        chrome.storage.local.get('authToken', (result) => {
            const currentAuthToken = result.authToken || authToken; // authToken is a global let in this file
            if (!currentAuthToken) {
                console.warn("[BG Popup Fetch] Auth token missing for session fetch.");
                sendResponse({ error: "Authorization token not available" });
                return; // from callback
            }
            fetch("https://botc.app/backend/sessions", {
                method: "GET",
                headers: { "Authorization": currentAuthToken }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().catch(() => null)
                        .then(errorBody => {
                            const errorMessage = errorBody ? (errorBody.message || JSON.stringify(errorBody)) : response.statusText;
                            const detailedError = `API Error ${response.status}: ${errorMessage}`;
                            console.error(`[BG Popup Fetch] ${detailedError}`);
                            throw new Error(detailedError);
                        });
                }
                return response.json();
            })
            .then(sessionsData => {
                if (sessionsData && typeof sessionsData.error !== 'undefined') {
                    console.error("[BG Popup Fetch] API returned 200 OK but with an error payload:", sessionsData.error);
                    sendResponse({ error: sessionsData.error });
                } else {
                    sendResponse(sessionsData);
                }
            })
            .catch(error => {
                console.error("[BG Popup Fetch] Error during fetch or processing:", error);
                sendResponse({ error: error.message || "Failed to fetch sessions" });
            });
        });
        return true; // Crucial for async sendResponse
    } else if (message.action === "getPlayerData") { // From popup
        chrome.storage.local.get('playerData', (data) => {
            if (chrome.runtime.lastError) {
                console.error("[BG] Error getting playerData for popup:", chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ playerData: data.playerData || {} });
            }
        });
        return true; // Async
    }

    // Messages from content_script or content_main.js
    else if (
        (message.source === 'content_script' &&
            (message.type === 'GAME_DATA' ||
             message.type === 'GAME_DATA_RAW' ||
             message.type === 'USER_ID_BATCH' ||
             message.type === 'GET_AUTH_TOKEN')
        ) ||
        (message.source === 'content_main_js_v3_6' && message.type === 'GET_AUTH_TOKEN')
    )
    {
        switch (message.type) {
            case 'GAME_DATA': 
            case 'GAME_DATA_RAW':
                console.log(`%c[BG] Game data received (via ${message.source}):`, 'color: lightblue', message.payload ? '(payload present)' : '(no payload)');
                // Ensure lastGameData is defined globally if you intend to use it here
                // lastGameData = { payload: message.payload, ... }; 
                const gameUserIds = processWebSocketPayloadForUserIds(message.payload, message.type); 
                sendResponse({ status: "GAME_DATA received by background", processed_ids: Array.from(gameUserIds) });
                return false; 

            case 'CHAT_DATA': 
            case 'CHAT_DATA_RAW':
                console.log(`%c[BG] Chat data received (via ${message.source}):`, 'color: lightgreen', message.payload ? '(payload present)' : '(no payload)');
                // Ensure lastChatData is defined globally if you intend to use it here
                // lastChatData = { payload: message.payload, ... };
                const chatUserIds = processWebSocketPayloadForUserIds(message.payload, message.type); 
                sendResponse({ status: "CHAT_DATA received by background", processed_ids: Array.from(chatUserIds) });
                return false; 

            case 'GET_AUTH_TOKEN': 
                console.log(`%c[BG] Received GET_AUTH_TOKEN request from ${message.source}.`, 'color: magenta');
                chrome.storage.local.get('authToken', (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('%c[BG] Error getting authToken from storage:', 'color: red', chrome.runtime.lastError);
                        sendResponse({ token: null, error: chrome.runtime.lastError.message });
                    } else {
                        console.log('%c[BG] authToken from storage:', 'color: magenta', result.authToken ? 'Token found' : 'Token NOT found');
                        sendResponse({ token: result.authToken || null });
                    }
                });
                return true; // Async

            default:
                console.warn(`%c[BG] Received unknown message type from ${message.source}: ${message.type}`, 'color: orange', message);
                sendResponse({ status: `Unknown message type from ${message.source}`, type: message.type });
                return false;
        }
    }

    // GET_PLAYER_DATA_MAIN: Specific handler for content_main's request for playerData
    else if (message.type === 'GET_PLAYER_DATA_MAIN' && message.source === 'content_script') {
        console.log(`%c[BG] Received GET_PLAYER_DATA_MAIN request from content_script (for content_main, ID: ${message.requestId}).`, 'color: dodgerblue');
        chrome.storage.local.get('playerData', (data) => {
            if (chrome.runtime.lastError) {
                console.error("[BG] Error getting playerData for GET_PLAYER_DATA_MAIN:", chrome.runtime.lastError);
                sendResponse({ playerData: null, error: chrome.runtime.lastError.message, requestId: message.requestId });
            } else {
                // console.log("[BG] Sending playerData to content_script for GET_PLAYER_DATA_MAIN.");
                sendResponse({ playerData: data.playerData || {}, error: null, requestId: message.requestId });
            }
        });
        return true; // Async
    }

    // UPDATE_PLAYER_USERNAME_IN_STORAGE: Specific handler for content_main's request to update username
    else if (message.type === 'UPDATE_PLAYER_USERNAME_IN_STORAGE' && message.source === 'content_script') {
        const { userId, username } = message.payload;
        console.log(`%c[BG] Received UPDATE_PLAYER_USERNAME_IN_STORAGE for ${userId} to "${username}".`, 'color: mediumpurple');
        chrome.storage.local.get('playerData', (result) => {
            if (chrome.runtime.lastError) {
                console.error('[BG] Error getting playerData for update:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }
            let playerData = result.playerData || {};
            let player = playerData[userId];
            let usernameChanged = false;

            if (!player) {
                player = {
                    id: userId,
                    name: username,
                    notes: "",
                    firstSeenTimestamp: Date.now(),
                    lastSeenTimestamp: Date.now(),
                    sessionHistory: [],
                    uniqueSessionCount: 0,
                    usernameHistory: []
                };
                playerData[userId] = player;
                usernameChanged = true; // New player, so effectively username changed from nothing
            } else {
                if (player.name !== username) {
                    const oldUsername = player.name;
                    if (oldUsername) { // Only add to history if there was an old username
                        player.usernameHistory = player.usernameHistory || [];
                        // Add old username to history if it's different and not already the most recent entry
                        const lastHistoryEntry = player.usernameHistory.length > 0 ? player.usernameHistory[0].username : null;
                        if (!lastHistoryEntry || lastHistoryEntry.toLowerCase() !== oldUsername.toLowerCase()) {
                            player.usernameHistory.unshift({ username: oldUsername, timestamp: Date.now() });
                            console.log(`%c[BG] Username history updated for ID ${userId}: '${oldUsername}' -> '${username}'.`, 'color: mediumpurple');
                        }
                    }
                    player.name = username;
                    usernameChanged = true;
                }
            }
            player.lastSeenTimestamp = Date.now(); // Always update last seen on any interaction

            if (usernameChanged) {
                 console.log(`%c[BG] Username for ${userId} updated to "${username}". Saving playerData.`, 'color: mediumpurple');
            } else {
                // console.log(`%c[BG] Username for ${userId} is already "${username}". Updating lastSeen. Saving playerData.`, 'color: gray');
            }

            chrome.storage.local.set({ playerData: playerData }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[BG] Error saving updated playerData:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true });
                }
            });
        });
        return true; // Async
    }

    else if (message.type === "SAVE_PLAYER_NOTES") { 
        console.log("[BG] Attempting to save player notes for player:", message.playerId, "Notes:", message.notes);
        chrome.storage.local.get(['playerData'], (result) => {
             if (chrome.runtime.lastError) {
                console.error("[BG] Error getting playerData for saving notes:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }
            let allPlayerData = result.playerData || {};
            if (!allPlayerData[message.playerId]) {
                allPlayerData[message.playerId] = { 
                    id: message.playerId, 
                    name: "Unknown Player", 
                    notes: "",
                    // Initialize other fields as necessary
                    firstSeenTimestamp: Date.now(),
                    lastSeenTimestamp: Date.now()
                };
            }
            allPlayerData[message.playerId].notes = message.notes;
            chrome.storage.local.set({ playerData: allPlayerData }, () => {
                if (chrome.runtime.lastError) {
                    console.error("[BG] Error saving player notes:", chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    console.log("[BG] Player notes saved successfully for player:", message.playerId);
                    sendResponse({ success: true });
                }
            });
        });
        return true; // Async
    }

    return false; // Default for unhandled messages
});

// Listen for network requests to extract the Authorization token
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const authHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "authorization");
        if (authHeader && authHeader.value && authHeader.value.startsWith("Bearer ")) {
            const newAuthTokenValue = authHeader.value;
            chrome.storage.local.get('authToken', (result) => {
                if (result.authToken !== newAuthTokenValue) {
                    authToken = newAuthTokenValue; // Update global for immediate use
                    chrome.storage.local.set({ authToken: newAuthTokenValue }, () => {
                        console.log("[BG] Auth token extracted/updated from network request and stored.");
                    });
                }
            });
        }
    },
    {
        urls: ["*://botc.app/backend/*"],
        types: ["xmlhttprequest", "main_frame", "sub_frame"]
    },
    ["requestHeaders"]
);

// Ensure global variables like activeGameUserIds are defined (they should be in lines 0-166)
// let lastGameData = null; // Define if used by handlers and not already defined
// let lastChatData = null; // Define if used by handlers and not already defined

// Function to extract user IDs from WebSocket payloads
function processWebSocketPayloadForUserIds(payload, messageType) {
    const newlyFoundIds = new Set();
    extractUserIdsFromPayloadRecursive(payload, newlyFoundIds);

    if (newlyFoundIds.size > 0) {
        let addedCount = 0;
        newlyFoundIds.forEach(id => {
            if (activeGameUserIds && !activeGameUserIds.has(id)) { // Ensure activeGameUserIds is defined
                activeGameUserIds.add(id);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            console.log(`%c[BG] ${addedCount} new User IDs added from ${messageType}. Current total unique IDs: ${activeGameUserIds ? activeGameUserIds.size : 'N/A'}`, 'color: cyan', Array.from(newlyFoundIds));
        }
    }
    return newlyFoundIds;
}

// Recursive helper for processWebSocketPayloadForUserIds
function extractUserIdsFromPayloadRecursive(data, idSet) {
    if (data === null || data === undefined) return;

    if (typeof data === 'string' && /^\d{10,}$/.test(data)) { idSet.add(data); }
    if (typeof data === 'number' && /^\d{10,}$/.test(String(data))) { idSet.add(String(data)); }

    if (typeof data !== 'object') { return; }

    if (Array.isArray(data)) {
        data.forEach(item => extractUserIdsFromPayloadRecursive(item, idSet));
    } else { 
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                if ((key === 'id' || key === 'userId' || key === 'user_id' || key === 'player_id' || key === 'authorID') && 
                    (typeof value === 'string' || typeof value === 'number')) {
                    const potentialId = String(value);
                    if (/^\d{10,}$/.test(potentialId)) {
                        idSet.add(potentialId);
                    }
                }
                if (typeof value === 'object' && value !== null) {
                    extractUserIdsFromPayloadRecursive(value, idSet);
                }
            }
        }
    }
}

console.log("[BG] Consolidated background script event listeners initialized. User ID extraction active.");

function clearUserIds() { 
    if (activeGameUserIds) {
        activeGameUserIds.clear();
        console.log("[BG] Active game user IDs cleared.");
    } else {
        console.warn("[BG] clearUserIds called, but activeGameUserIds is not defined.");
    }
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        let storageChange = changes[key];
        if (key === 'authToken') {
            console.log('[BG] authToken in chrome.storage.local changed.');
            authToken = storageChange.newValue; 
        }
    }
});