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
        chrome.storage.local.get(['authToken', 'playerData'], (result) => {
            if (result.authToken && result.playerData) {
                fetchAndProcessSessionsInBackground(result.authToken, result.playerData);
            } else {
                console.warn("[BG_ALARM] Auth token or player data not found. Skipping background fetch.");
            }
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
        // Use token from local storage if available, fallback to global var (less reliable for service worker)
        chrome.storage.local.get('authToken', (result) => {
            const currentAuthToken = result.authToken || authToken; // Prefer stored token
            if (!currentAuthToken) {
                console.warn("Auth token missing for session fetch (popup).ทั้งในตัวแปรและ storage");
                sendResponse({ error: "Authorization token not available" });
                return; // Exit early
            }

            fetch("https://botc.app/backend/sessions", {
                method: "GET",
                headers: {
                    "Authorization": currentAuthToken
                }
            })
            .then(response => response.json().then(data => ({ status: response.status, ok: response.ok, data })))
            .then(({ status, ok, data }) => {
                if (ok) {
                    sendResponse({ sessions: data });
                } else {
                    console.error("API returned an error (popup fetch):", data);
                    sendResponse({ error: `API Error ${status}: ${JSON.stringify(data)}` });
                }
            })
            .catch(error => {
                console.error("Error fetching session data (popup fetch):", error);
                sendResponse({ error: error.message });
            });
        });
        return true; // Indicates async response
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