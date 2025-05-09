// content_main.js
(function() {
    // v3.6 of the main world script - Request Auth Token via Extension Messaging
    if (window.hasBoTCMainWorldTrackerRun_v3_6) { 
        return;
    }
    window.hasBoTCMainWorldTrackerRun_v3_6 = true; 
    console.log("--- BOTC TRACKER: content_main.js (MAIN WORLD v3.6) LOADED ---");

    const originalWebSocket = window.WebSocket;

    if (!originalWebSocket || typeof originalWebSocket !== 'function' || !originalWebSocket.prototype) {
        console.error("--- BOTC TRACKER (Main World v3.6): Original window.WebSocket is NOT FOUND. Cannot proceed.");
        return;
    }

    let socketIdCounter = 0;
    let foundUserIds = new Set();
    let previousFoundUserIdsSize = 0;
    const userIdToUsernameCache = {}; 
    let tokenPromiseResolvers = {}; 
    let currentToken = null;
    let isFetchingToken = false;
    let tokenCallbacks = [];
    let playerDataPromiseResolvers = {}; // For handling playerData responses
    let playerDataRequestId = 0;

    // Rate Limiting for API calls to /backend/user/{userId}
    const MAX_REQUESTS_PER_SECOND = 2;
    const REQUEST_INTERVAL_MS = 1000 / MAX_REQUESTS_PER_SECOND; // 500ms
    let apiRequestQueue = []; // Stores { userId, authToken, resolvePromise, attemptCount }
    let lastApiRequestTimestamp = 0;
    let isProcessingApiQueue = false;
    const MAX_API_ATTEMPTS = 3; // Max retries for 429 or network errors

    window.addEventListener('message', function(event) {
        if (event.source !== window || !event.data || !event.data.source || event.data.source !== 'content_script') {
            return;
        }

        if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
            console.log('%cBOTC Tracker (Main World): Auth Token received from background:', event.data.token ? 'Exists' : 'Missing', 'color: blue;');
            currentToken = event.data.token || null;
            isFetchingToken = false;
            tokenCallbacks.forEach(callback => callback(currentToken));
            tokenCallbacks = []; 
        } else if (event.data.type === 'PLAYER_DATA_RESPONSE_MAIN') {
            const { requestId, playerData, error } = event.data;
            if (playerDataPromiseResolvers[requestId]) {
                if (error) {
                    console.error(`%cBOTC Tracker (Main World): Error receiving playerData: ${error}`, 'color: red;');
                    playerDataPromiseResolvers[requestId].reject(error);
                } else {
                    console.log('%cBOTC Tracker (Main World): PlayerData received from background.', 'color: blue;');
                    playerDataPromiseResolvers[requestId].resolve(playerData || {});
                }
                delete playerDataPromiseResolvers[requestId];
            }
        }
    });

    function requestAuthTokenFromBackground(callback) {
        tokenCallbacks.push(callback);
        if (!isFetchingToken) {
            isFetchingToken = true;
            console.log('%cBOTC Tracker (Main World): Requesting auth token from background script...', 'color: blue;');
            window.postMessage({ _botcTrackerMessage: true, source: 'content_main_js_v3_6', type: 'REQUEST_AUTH_TOKEN' }, '*');
        }
    }

    function getPlayerDataFromBackground() {
        return new Promise((resolve, reject) => {
            const requestId = `pdReq_${playerDataRequestId++}`;
            playerDataPromiseResolvers[requestId] = { resolve, reject };
            // console.log(`%cBOTC Tracker (Main World): Requesting playerData from background (ID: ${requestId})...`, 'color: blue;');
            window.postMessage({ 
                _botcTrackerMessage: true, 
                source: 'content_main_js_v3_6', 
                type: 'GET_PLAYER_DATA_MAIN', 
                requestId: requestId 
            }, '*');
            // Timeout for the promise
            setTimeout(() => {
                if (playerDataPromiseResolvers[requestId]) {
                    console.warn(`%cBOTC Tracker (Main World): Timeout waiting for playerData response (ID: ${requestId}).`, 'color: orange;');
                    playerDataPromiseResolvers[requestId].reject('Timeout');
                    delete playerDataPromiseResolvers[requestId];
                }
            }, 5000); // 5 second timeout
        });
    }

    function updatePlayerUsernameInStorage(userId, username) {
        // console.log(`%cBOTC Tracker (Main World): Requesting to update username for ${userId} to "${username}" in storage...`, 'color: blue;');
        window.postMessage({ 
            _botcTrackerMessage: true, 
            source: 'content_main_js_v3_6', 
            type: 'UPDATE_PLAYER_USERNAME_IN_STORAGE', 
            payload: { userId, username } 
        }, '*');
    }

    async function executeApiFetch(userId, authToken, resolvePromise, attemptCount = 1) {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
            headers['Authorization'] = authToken; 
        } else {
            console.warn(`%cBOTC Tracker: No auth token available for API fetch (User ${userId}).`, 'color: orange;');
        }

        try {
            console.log(`%cBOTC Tracker: Fetching user ${userId} from API (Attempt: ${attemptCount})...`, 'color: blueviolet;');
            const response = await fetch(`https://botc.app/backend/user/${userId}`, { headers });

            if (response.status === 429) {
                console.warn(`%cBOTC Tracker: API rate limit (429) hit for user ${userId}. Attempt ${attemptCount}/${MAX_API_ATTEMPTS}.`, 'color: orange;');
                if (attemptCount < MAX_API_ATTEMPTS) {
                    // Re-queue with increased delay (simple backoff for now by re-adding to queue)
                    // The natural queue processing delay will provide some backoff.
                    // A more sophisticated exponential backoff could be added later if needed.
                    console.log(`%cBOTC Tracker: Re-queuing user ${userId} after 429.`, 'color: orange;');
                    apiRequestQueue.unshift({ userId, authToken, resolvePromise, attemptCount: attemptCount + 1 }); // Add to front for quicker retry
                    // Don't resolve the promise yet, it will be resolved on a successful attempt or max attempts reached.
                } else {
                    console.error(`%cBOTC Tracker: Max attempts reached for user ${userId} after 429. Giving up.`, 'color: red;');
                    userIdToUsernameCache[userId] = null; // Mark as failed
                    resolvePromise(null); // Resolve with null after max attempts
                }
                return; // Don't proceed further in this attempt
            }

            if (!response.ok) {
                console.warn(`%cBOTC Tracker: Failed to fetch user data for ${userId} from API. Status: ${response.status}`, 'color: orange;');
                userIdToUsernameCache[userId] = null;
                resolvePromise(null);
                return;
            }

            const userData = await response.json();
            if (userData && userData.user && userData.user.username) {
                const username = userData.user.username;
                // This log will now be in the main fetchAndCacheUsername success path
                // console.log(`%cBOTC Tracker: Fetched username for ${userId} from API: ${username}`, 'color: green;');
                resolvePromise(username); // Resolve with the fetched username
            } else {
                console.warn(`%cBOTC Tracker: Username not found in API response for ${userId}.`, 'color: orange;');
                userIdToUsernameCache[userId] = null;
                resolvePromise(null);
            }
        } catch (error) {
            console.error(`%cBOTC Tracker: Network/fetch error for user ${userId} (Attempt ${attemptCount}):`, 'color: red;', error);
            if (attemptCount < MAX_API_ATTEMPTS) {
                console.log(`%cBOTC Tracker: Re-queuing user ${userId} after network error.`, 'color: orange;');
                apiRequestQueue.unshift({ userId, authToken, resolvePromise, attemptCount: attemptCount + 1 });
            } else {
                console.error(`%cBOTC Tracker: Max attempts reached for user ${userId} after network errors. Giving up.`, 'color: red;');
                userIdToUsernameCache[userId] = null;
                resolvePromise(null);
            }
        }
    }

    async function processApiRequestQueue() {
        if (isProcessingApiQueue || apiRequestQueue.length === 0) {
            return;
        }
        isProcessingApiQueue = true;

        const now = Date.now();
        const timeSinceLast = now - lastApiRequestTimestamp;

        if (timeSinceLast >= REQUEST_INTERVAL_MS) {
            const { userId, authToken, resolvePromise, attemptCount } = apiRequestQueue.shift();
            lastApiRequestTimestamp = now;
            // No longer directly calling isProcessingApiQueue = false here, executeApiFetch will handle it or re-queue
            await executeApiFetch(userId, authToken, resolvePromise, attemptCount);
            isProcessingApiQueue = false; // Safe to set after await
            processApiRequestQueue(); // Process next if any
        } else {
            const delay = REQUEST_INTERVAL_MS - timeSinceLast;
            setTimeout(() => {
                isProcessingApiQueue = false;
                processApiRequestQueue();
            }, delay);
        }
    }

    function scheduleApiRequest(userId, authToken, resolvePromiseCallback) {
        apiRequestQueue.push({ userId, authToken, resolvePromise: resolvePromiseCallback, attemptCount: 1 });
        processApiRequestQueue();
    }

    async function fetchAndCacheUsername(userId) {
        console.log(`%cBOTC Tracker: fetchAndCacheUsername called for userId: ${userId}`, 'color: #777;');

        // 1. Check in-memory cache first
        if (userIdToUsernameCache.hasOwnProperty(userId)) {
            if (userIdToUsernameCache[userId] !== null) { // If not null, it's a valid cached username
                console.log(`%cBOTC Tracker: Username for ${userId} FOUND in IN-MEMORY cache: ${userIdToUsernameCache[userId]}`, 'color: green;');
                return userIdToUsernameCache[userId];
            }
            // If null, it means we might have tried before and failed, or it's explicitly not found.
            console.log(`%cBOTC Tracker: User ${userId} found in IN-MEMORY cache but value is NULL. Will check persistent storage.`, 'color: #FFA500;'); // Orange
        } else {
            console.log(`%cBOTC Tracker: User ${userId} NOT found in IN-MEMORY cache. Will check persistent storage.`, 'color: #777;');
        }

        // 2. Request playerData from background to check persistent storage
        try {
            console.log(`%cBOTC Tracker: User ${userId} - Attempting to get playerData from background script...`, 'color: #777;');
            const storedPlayerData = await getPlayerDataFromBackground(); // relies on the log in the message listener for receipt confirmation
            
            if (storedPlayerData && storedPlayerData[userId] && storedPlayerData[userId].name) {
                const usernameFromStorage = storedPlayerData[userId].name;
                console.log(`%cBOTC Tracker: Username for ${userId} FOUND in PERSISTENT storage (playerData): ${usernameFromStorage}`, 'color: green;');
                userIdToUsernameCache[userId] = usernameFromStorage; // Update in-memory cache for subsequent calls in this session
                return usernameFromStorage;
            } else {
                 console.log(`%cBOTC Tracker: User ${userId} - Username NOT found in received PERSISTENT storage (playerData), or playerData was empty/malformed for this user.`, 'color: #FFA500;');
            }
        } catch (error) {
            console.warn(`%cBOTC Tracker: User ${userId} - Error fetching playerData from background: ${error}. Will proceed to API if appropriate.`, 'color: red;');
        }
        
        // This check is crucial: if we've already tried the API and it failed (marked as null in in-memory cache),
        // and we didn't find it in persistent storage either, then don't try the API again for this session.
        if (userIdToUsernameCache.hasOwnProperty(userId) && userIdToUsernameCache[userId] === null) {
            console.log(`%cBOTC Tracker: User ${userId} was previously marked as failed API lookup (null in-memory) AND not found in persistent storage. SKIPPING API call.`, 'color: red;');
            return null;
        }

        console.log(`%cBOTC Tracker: User ${userId} - Cache checks complete. Proceeding to API fetch.`, 'color: #777;');
        // 3. Fetch from API if not found in caches (or if storage check failed and not previously marked as API failure)
        return new Promise((resolveOuter) => {
            requestAuthTokenFromBackground(async (authToken) => {
                // The actual fetch is now scheduled and handled by the queue processor
                scheduleApiRequest(userId, authToken, (fetchedUsername) => {
                    // This callback is invoked by executeApiFetch via resolvePromise
                    if (fetchedUsername !== null) {
                        userIdToUsernameCache[userId] = fetchedUsername;
                        console.log(`%cBOTC Tracker: Username for ${userId} obtained via API/cache: ${fetchedUsername}`, 'color: green;');
                        updatePlayerUsernameInStorage(userId, fetchedUsername);
                    } else {
                        // Failure (null) already logged by executeApiFetch or prior cache checks
                        // userIdToUsernameCache[userId] is already set to null in case of API failure
                        console.log(`%cBOTC Tracker: Username for ${userId} could not be obtained.`, 'color: orange;');
                    }
                    resolveOuter(fetchedUsername); // Resolve the main promise of fetchAndCacheUsername
                });
            });
        });
    }

    function extractIdsRecursively(data, idSet) {
        if (data === null || data === undefined) return;
        if (typeof data === 'string' && /^\d{10,}$/.test(data)) { idSet.add(data); }
        if (typeof data === 'number' && /^\d{10,}$/.test(String(data))) { idSet.add(String(data)); }
        if (typeof data !== 'object') { return; }
        if (Array.isArray(data)) { data.forEach(item => extractIdsRecursively(item, idSet)); }
        else { 
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const value = data[key];
                    if (key === 'id' || key === 'userId') {
                        const potentialId = String(value);
                        if (/^\d{10,}$/.test(potentialId)) { idSet.add(potentialId); }
                    }
                    if (typeof value === 'object' && value !== null) { extractIdsRecursively(value, idSet); }
                }
            }
        }
    }

    async function handleSocketMessage(event, socketId, socketType /* this = socket instance */) {
        const socketURL = this.url;
        let data = event.data;
        let parsedData = data;
        let rawDataType = null;
        let ioEventName = null;
        let messageTypeForBackground;

        try {
            if (typeof data === 'string') {
                if (data.startsWith('42[')) { 
                    const firstBracket = data.indexOf('[');
                    const lastBracket = data.lastIndexOf(']');
                    if (firstBracket !== -1 && lastBracket > firstBracket) {
                        const content = data.substring(firstBracket + 1, lastBracket);
                        const firstComma = content.indexOf(',');
                        if (firstComma !== -1) {
                            ioEventName = JSON.parse(content.substring(0, firstComma));
                            const payloadString = content.substring(firstComma + 1);
                            try { parsedData = JSON.parse(payloadString); } 
                            catch (e) { parsedData = payloadString; rawDataType = 'SOCKETIO_PAYLOAD_PARSE_ERROR'; }
                        } else { 
                             try { parsedData = JSON.parse(content); } 
                             catch (e) { parsedData = content; rawDataType = 'SOCKETIO_SINGLE_CONTENT_PARSE_ERROR'; }
                        }
                    } else { rawDataType = 'SOCKETIO_MALFORMED_BRACKETS'; }
                } else if (data.match(/^\d+$/)) { 
                    rawDataType = 'SOCKETIO_NUMERIC';
                    parsedData = data; 
                } else {
                    try { parsedData = JSON.parse(data); } 
                    catch (e) { rawDataType = 'STRING_RAW'; }
                }
            } else if (data instanceof Blob || data instanceof ArrayBuffer) {
                rawDataType = 'BINARY_RAW';
            } else { rawDataType = 'UNKNOWN_RAW'; }
        } catch (error) {
            console.error(`%cBOTC Chat Monitor: [Socket ${socketId}] Error parsing message:`, 'color: red;', error);
            rawDataType = 'MESSAGE_PROCESSING_ERROR';
            parsedData = data; 
        }

        const initialIdCount = foundUserIds.size;
        extractIdsRecursively(parsedData, foundUserIds);

        if (foundUserIds.size > initialIdCount) {
            console.log('%cBOTC Tracker: Updated User ID List:', 'color: green; font-weight: bold;', Array.from(foundUserIds));
            foundUserIds.forEach(userId => {
                if (!userIdToUsernameCache.hasOwnProperty(userId)) { 
                    fetchAndCacheUsername(userId); 
                }
            });
        }
        previousFoundUserIdsSize = foundUserIds.size; 

        if (socketType === 'Backend') messageTypeForBackground = rawDataType ? 'GAME_DATA_RAW' : 'GAME_DATA';
        else if (socketType === 'Chat') messageTypeForBackground = rawDataType ? 'CHAT_DATA_RAW' : 'CHAT_DATA';
        else messageTypeForBackground = rawDataType ? 'UNKNOWN_DATA_RAW' : 'UNKNOWN_DATA';
        
        if (rawDataType === 'SOCKETIO_NUMERIC' && (parsedData === '2' || parsedData === '3')) return;

        const messageToContentScript = {
            _botcTrackerMessage: true, source: 'content_main_js_v3_6', 
            type: messageTypeForBackground, payload: parsedData, url: socketURL,
            socketInternalId: `ws-${socketId}`, socketAppType: socketType,
            rawDataType: rawDataType, socketIOEventName: ioEventName,
            timestamp: new Date().toISOString(),
        };
        window.postMessage(messageToContentScript, '*');
    }

    window.WebSocket = function(...args) {
        const socketUrl = args[0];
        const socketId = ++socketIdCounter;
        let socketType = 'Unknown';
        if (socketUrl.includes('/backend/socket')) socketType = 'Backend';
        else if (socketUrl.includes('/socket.io')) socketType = 'Chat';

        console.log(`%cBOTC Chat Monitor: Page attempting WebSocket [ID ${socketId}] to: ${socketUrl.substring(0,100)}... (Type: ${socketType})`, 'color: purple; font-weight: bold;');
        const socket = new originalWebSocket(...args);
        console.log(`%cBOTC Chat Monitor: [Socket ${socketId}] CREATED. Attaching listeners...`, 'color: purple; font-weight: bold;');
        
        let pageAssignedOnMessageHandler = null; 

        try {
            const ourMessageInterceptor = (event) => {
                handleSocketMessage.call(socket, event, socketId, socketType);
                if (typeof pageAssignedOnMessageHandler === 'function') {
                    try { pageAssignedOnMessageHandler.call(socket, event); }
                    catch (e) { console.error(`%cBOTC Chat Monitor: Error in page's onmessage for socket ${socketId}:`, 'color: red;', e);}
                }
            };
            socket.addEventListener('message', ourMessageInterceptor);

            socket.addEventListener('open', (event) => { console.log(`%cBOTC Chat Monitor: [Socket ${socketId} (${socketType})] 'open' FIRED.`, 'color: #FF69B4;'); });
            socket.addEventListener('close', (event) => { console.log(`%cBOTC Chat Monitor: [Socket ${socketId} (${socketType})] 'close' FIRED. Code: ${event.code}, Reason: '${event.reason}'`, 'color: #FF69B4;'); });
            socket.addEventListener('error', (event) => { console.log(`%cBOTC Chat Monitor: [Socket ${socketId} (${socketType})] 'error' FIRED.`, 'color: red;', event); });

            Object.defineProperty(socket, 'onmessage', {
                configurable: true, enumerable: true,
                get() { return pageAssignedOnMessageHandler; },
                set(newOnMessageCallback) {
                    console.log(`%cBOTC Chat Monitor: [Socket ${socketId}] Page SETTING socket.onmessage. Handler:`, 'color: #FFD700;', newOnMessageCallback);
                    pageAssignedOnMessageHandler = newOnMessageCallback;
                }
            });
        } catch (err) {
            console.error("%cBOTC Chat Monitor: Error in WebSocket override setup for socket " + socketId + ":", 'color: red;', err);
        }
        console.log(`%cBOTC Chat Monitor: [Socket ${socketId}] Finished setup, returning instrumented socket.`, 'color: purple; font-weight: bold;');
        return socket;
    };
    console.log("--- BOTC TRACKER (Main World v3.6): window.WebSocket REPLACED. ---");
})();
