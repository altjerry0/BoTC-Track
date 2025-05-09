console.log("--------------------------------------------------");
console.log("--- BOTC TRACKER CONTENT SCRIPT (ISOLATED WORLD) v2 --- ");
console.log("--------------------------------------------------");

(function() {
    // Ensure this script runs only once per frame/context
    if (window.hasBoTCIsolatedWorldInjectorRun_v2) {
        console.log("--- BOTC TRACKER (Isolated World v2): Injector script already ran. Skipping. ---");
        return;
    }
    window.hasBoTCIsolatedWorldInjectorRun_v2 = true;

    console.log("--- BOTC TRACKER (Isolated World v2): Attempting to inject content_main.js into the main world. ---");

    try {
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript'); // Good practice
        // Construct the URL to the web-accessible resource
        script.src = chrome.runtime.getURL('src/content/content_main.js');
        
        // Append to head or documentElement for earliest possible execution
        (document.head || document.documentElement).appendChild(script);
        
        script.onload = () => {
            console.log("--- BOTC TRACKER (Isolated World v2): content_main.js INJECTED and LOADED into the main world. ---");
            // Optional: remove the script tag from the DOM after it has loaded
            // script.remove(); 
        };
        script.onerror = (e) => {
            console.error("--- BOTC TRACKER (Isolated World v2): ERROR injecting content_main.js. Check path & manifest.json web_accessible_resources. Details:", e);
        };
    } catch (e) {
        console.error("--- BOTC TRACKER (Isolated World v2): CRITICAL ERROR creating script tag for content_main.js: ---", e);
    }

    // Listen for messages from the main world script (content_main.js)
    window.addEventListener('message', (event) => {
        // Security: Check the origin of the message
        if (event.source !== window || event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.source === 'content_main_js_v3_6') {
            console.log('[CS] Received message from content_main.js:', event.data);
            if (event.data.type === 'REQUEST_AUTH_TOKEN') {
                console.log('[CS] Received REQUEST_AUTH_TOKEN from content_main.js. Relaying to background.js...');
                chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN', source: 'content_script' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[CS] Error sending GET_AUTH_TOKEN to background or receiving response:', chrome.runtime.lastError.message);
                        // Send an error response back to content_main.js
                        window.postMessage({ type: 'AUTH_TOKEN_RESPONSE', token: null, error: `CS Error: ${chrome.runtime.lastError.message}`, source: 'content_script' }, event.origin);
                        return;
                    }
                    if (response && typeof response.token !== 'undefined') {
                        console.log('[CS] Relaying AUTH_TOKEN_RESPONSE to content_main.js with token:', response.token ? 'Token PRESENT' : 'Token NULL');
                        window.postMessage({ type: 'AUTH_TOKEN_RESPONSE', token: response.token, source: 'content_script' }, event.origin);
                    } else {
                        console.warn('[CS] Invalid or missing token in response from background for auth token:', response);
                        window.postMessage({ type: 'AUTH_TOKEN_RESPONSE', token: null, error: 'Invalid or missing token in response from background (auth)', source: 'content_script' }, event.origin);
                    }
                });
            } else if (event.data.type === 'GET_PLAYER_DATA_MAIN') {
                console.log('[CS] Received GET_PLAYER_DATA_MAIN from content_main.js. Relaying to background.js...', event.data);
                chrome.runtime.sendMessage({ type: 'GET_PLAYER_DATA_MAIN', source: 'content_script', requestId: event.data.requestId }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[CS] Error sending GET_PLAYER_DATA_MAIN to background or receiving response:', chrome.runtime.lastError.message);
                        window.postMessage({ type: 'PLAYER_DATA_RESPONSE_MAIN', playerData: null, error: `CS Error: ${chrome.runtime.lastError.message}`, source: 'content_script', requestId: event.data.requestId }, event.origin);
                        return;
                    }
                    if (response) {
                        window.postMessage({ type: 'PLAYER_DATA_RESPONSE_MAIN', playerData: response.playerData, error: response.error, source: 'content_script', requestId: event.data.requestId }, event.origin);
                    } else {
                        console.warn('[CS] Empty or invalid response from background for GET_PLAYER_DATA_MAIN');
                        window.postMessage({ type: 'PLAYER_DATA_RESPONSE_MAIN', playerData: null, error: 'Empty response from background (playerData)', source: 'content_script', requestId: event.data.requestId }, event.origin);
                    }
                });
            } else if (event.data.type === 'UPDATE_PLAYER_USERNAME_IN_STORAGE') {
                console.log('[CS] Received UPDATE_PLAYER_USERNAME_IN_STORAGE from content_main.js. Relaying to background.js...', event.data.payload);
                chrome.runtime.sendMessage({ 
                    type: 'UPDATE_PLAYER_USERNAME_IN_STORAGE', 
                    source: 'content_script', 
                    payload: event.data.payload 
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[CS] Error sending UPDATE_PLAYER_USERNAME_IN_STORAGE to background:', chrome.runtime.lastError.message);
                    } else if (response && response.error) {
                        console.error('[CS] Background error updating username in storage:', response.error);
                    } else if (response && response.success) {
                        console.log('[CS] Background confirmed username update in storage.');
                    }
                });
            } else if (event.data.type === 'USER_ID_BATCH_FROM_MAIN') {
                console.log('[CS] Received USER_ID_BATCH_FROM_MAIN from content_main.js:', event.data.payload);
                // Optionally, content_script could do something with this, or just log
                // For now, let's assume background script is the primary processor of user IDs if needed through other means.
            } else {
                console.log('[CS] Received unhandled message type from content_main_js_v3_6:', event.data.type);
            }
        } else if (event.data && event.data.type && event.data.type.startsWith('webpackHotUpdate')) {
            return;
        } else {
            // console.log('[CS] Received other window message (ignoring):', event.data); // Can be noisy
        }
    }, false);

    console.log("--- BOTC TRACKER (Isolated World v2): Setup complete. Listening for messages from main world. ---");

})();
