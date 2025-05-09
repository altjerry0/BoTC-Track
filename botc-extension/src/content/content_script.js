console.log("--------------------------------------------------");
console.log("--- BOTC TRACKER CONTENT SCRIPT VERY TOP LEVEL --- BOTC TRACKER --- ");
console.log("--------------------------------------------------");

(function() {
    console.log("--- BOTC TRACKER: IIFE ENTERED ---");

    if (window.hasBoTCWebSocketInterceptorRun) {
        console.log("--- BOTC TRACKER: Interceptor already ran. Skipping. ---");
        return;
    }
    window.hasBoTCWebSocketInterceptorRun = true;

    console.log("--- BOTC TRACKER: Attempting to SET UP WebSocket interceptor (using GETTER method). ---");

    const OriginalWebSocket = window.WebSocket;
    if (!OriginalWebSocket) {
        console.error("--- BOTC TRACKER: Original window.WebSocket is NOT FOUND. Cannot proceed. ---");
        return;
    }

    const ProxiedWebSocket = function(url, protocols) {
        console.log(`--- BOTC TRACKER PROXY: new WebSocket CONSTRUCTION attempted for URL: ${url} ---`);

        let socketInstance;
        try {
            if (protocols) {
                socketInstance = new OriginalWebSocket(url, protocols);
            } else {
                socketInstance = new OriginalWebSocket(url);
            }
        } catch (err) {
            console.error(`--- BOTC TRACKER PROXY: Error constructing original WebSocket for ${url}:`, err);
            throw err;
        }

        const isGameBackendSocket = url.startsWith('wss://botc.app/backend/socket/');
        const isChatSocket = url.startsWith('wss://chat-') && url.includes('.botc.app/socket.io/');

        if (isGameBackendSocket || isChatSocket) {
            console.log(`--- BOTC TRACKER PROXY: Intercepting messages for TARGETED URL: ${url} ---`);

            socketInstance.addEventListener('message', event => {
                let messagePreview = event.data ? (typeof event.data === 'string' ? event.data.substring(0, 100) + '...' : '[binary data or non-string]') : '[no data]';
                console.log(`--- BOTC TRACKER PROXY: Received message from ${url}: ---`, messagePreview);
                
                let parsedData;
                try {
                    if (event.data && typeof event.data === 'string' && event.data.match(/^\d+/) && event.data.includes('[')) {
                        const jsonPart = event.data.substring(event.data.indexOf('['));
                        parsedData = JSON.parse(jsonPart);
                    } else if (typeof event.data === 'string') {
                        parsedData = JSON.parse(event.data);
                    } else {
                        throw new Error('Cannot parse non-string data as JSON');
                    }
                    console.log('--- BOTC TRACKER PROXY: Parsed data: ---', parsedData);

                    chrome.runtime.sendMessage({
                        type: isGameBackendSocket ? 'GAME_DATA' : 'CHAT_DATA',
                        source: 'content_script',
                        payload: parsedData,
                        url: url
                    }, response => {
                        if (chrome.runtime.lastError) {
                            console.error('--- BOTC TRACKER PROXY: Error sending PARSED message to background: ---', chrome.runtime.lastError.message);
                        }
                    });
                } catch (error) {
                    console.warn(`--- BOTC TRACKER PROXY: Could not parse message from ${url} as JSON. Details below. Sending raw. ---`);
                    console.warn("Original data preview:", messagePreview);
                    console.warn("Parsing error:", error);

                     chrome.runtime.sendMessage({
                        type: isGameBackendSocket ? 'GAME_DATA_RAW' : 'CHAT_DATA_RAW',
                        source: 'content_script',
                        payload: event.data, 
                        url: url
                    }, response => {
                        if (chrome.runtime.lastError) {
                            console.error('--- BOTC TRACKER PROXY: Error sending RAW message to background: ---', chrome.runtime.lastError.message);
                        }
                    });
                }
            });

            socketInstance.addEventListener('open', () => {
                console.log(`--- BOTC TRACKER PROXY: Intercepted WebSocket OPENED for ${url} ---`);
            });
            socketInstance.addEventListener('close', event => {
                console.log(`--- BOTC TRACKER PROXY: Intercepted WebSocket CLOSED for ${url} ---`, event);
            });
            socketInstance.addEventListener('error', error => {
                console.error(`--- BOTC TRACKER PROXY: Intercepted WebSocket ERROR for ${url} ---`, error);
            });
        } else {
            console.log(`--- BOTC TRACKER PROXY: NOT intercepting messages for URL: ${url} ---`);
        }
        return socketInstance;
    };

    ProxiedWebSocket.prototype = OriginalWebSocket.prototype;
    ProxiedWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    ProxiedWebSocket.OPEN = OriginalWebSocket.OPEN;
    ProxiedWebSocket.CLOSING = OriginalWebSocket.CLOSING;
    ProxiedWebSocket.CLOSED = OriginalWebSocket.CLOSED;

    try {
        Object.defineProperty(window, 'WebSocket', {
            get: function() {
                console.log("--- BOTC TRACKER: window.WebSocket GETTER ACCESSED! Returning ProxiedWebSocket. ---");
                return ProxiedWebSocket;
            },
            configurable: true
        });
        console.log("--- BOTC TRACKER: WebSocket GETTER successfully defined on window object. ---");
    } catch (e) {
        console.error("--- BOTC TRACKER: FAILED to define WebSocket GETTER on window object: ---", e);
    }
})();
