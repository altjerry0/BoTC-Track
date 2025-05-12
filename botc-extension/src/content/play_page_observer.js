// Content script injected into https://botc.app/play/* to observe game state
// console.log('[BotC Tracker - ECG] Play Page Observer Loaded');

// Debounce function to limit the rate of DOM scan calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Helper function to safely send message to the background script
function safeSendMessage(message) {
    if (chrome.runtime && chrome.runtime.id) { // Check if context is valid
        try {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    // Avoid spamming console if the error is specifically about context invalidation, 
                    // as this is expected if the extension is reloaded/disabled.
                    if (chrome.runtime.lastError.message !== "Extension context invalidated." && 
                        !chrome.runtime.lastError.message.includes("Could not establish connection. Receiving end does not exist.")) {
                        console.warn('[BotC Tracker - ECG] Error sending message to background:', chrome.runtime.lastError.message);
                    }
                } else {
                    // Optional: Log response from background if needed
                    // console.log('[BotC Tracker - ECG] Background script responded to content script:', response);
                }
            });
        } catch (error) {
            // This catch block might catch the "Extension context invalidated" if it throws synchronously
            // or other synchronous errors during the setup of sendMessage.
            if (error.message !== "Extension context invalidated." && 
                !error.message.includes("Extension context invalidated")) { // Broader check for the error string
                console.warn('[BotC Tracker - ECG] Exception during sendMessage call setup:', error.message);
            }
        }
    } else {
        // console.log('[BotC Tracker - ECG] Extension context is invalidated. Message not sent.'); 
        // Optionally: Could consider stopping the observer if the context is permanently gone.
    }
}

// Function to scan the DOM for player and storyteller IDs
function scanPlayPageForGameInfo() {
    // console.log('[BotC Tracker - ECG] Scanning Play Page DOM...');
    const playerIds = new Set();
    let storytellerId = null;

    // Select all elements that potentially contain player IDs
    // Looking for classes like 'player id-XXXXXXXXXX ...'
    const playerElements = document.querySelectorAll('.player[class*=" id-"]');
    playerElements.forEach(el => {
        const match = el.className.match(/\bid-(\d{10,})\b/); // Match 'id-' followed by 10+ digits
        if (match && match[1]) {
            playerIds.add(match[1]);
        }
    });

    // Select the element that potentially contains the storyteller ID
    // Looking for classes like 'storyteller id-XXXXXXXXXX ...'
    const storytellerElement = document.querySelector('.storyteller[class*=" id-"]');
    if (storytellerElement) {
        const match = storytellerElement.className.match(/\bid-(\d{10,})\b/); // Match 'id-' followed by 10+ digits
        if (match && match[1]) {
            storytellerId = match[1];
            // Also add storyteller to playerIds list if they aren't already there
            playerIds.add(storytellerId);
        }
    }

    const gameInfo = {
        playerIds: Array.from(playerIds),
        storytellerId: storytellerId,
    };

    // Only send message if we found any players or a storyteller
    if (gameInfo.playerIds.length > 0 || gameInfo.storytellerId) {
        // console.log('[BotC Tracker - ECG] Found Game Info:', gameInfo);
        safeSendMessage({ type: 'CURRENT_GAME_INFO', payload: gameInfo });
    } else {
        // console.log('[BotC Tracker - ECG] No player/storyteller IDs found in DOM.');
        // Send null if no game is detected (e.g., user left the game)
        safeSendMessage({ type: 'CURRENT_GAME_INFO', payload: null });
    }
}

// Debounced version of the scan function
const debouncedScan = debounce(scanPlayPageForGameInfo, 500); // Scan at most every 500ms

// --- MutationObserver Setup ---
// Select the node that will be observed for mutations
// This might need adjustment based on the actual structure of botc.app/play
// We aim for a container that wraps the player list and storyteller info
const targetNode = document.body; // Start broad, refine if possible/needed

if (targetNode) {
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] }; // Observe class changes specifically

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        // Use `for...of` loop to iterate over mutations
        let relevantChangeDetected = false;
        for(const mutation of mutationsList) {
            // Check if a class attribute changed, or if nodes were added/removed
            if (mutation.type === 'childList' || (mutation.type === 'attributes' && mutation.attributeName === 'class')) {
                // Check if the change involves elements likely related to players/storyteller
                // This is a heuristic; refine if needed
                const targetElement = mutation.target;
                if (targetElement && typeof targetElement.matches === 'function' && 
                    (targetElement.matches('.player, .storyteller, .player *, .storyteller *') || 
                     (mutation.addedNodes && Array.from(mutation.addedNodes).some(node => node.nodeType === 1 && (node.matches('.player, .storyteller') || node.querySelector('.player, .storyteller')))) ||
                     (mutation.removedNodes && Array.from(mutation.removedNodes).some(node => node.nodeType === 1 && (node.matches('.player, .storyteller') || node.querySelector('.player, .storyteller'))))
                    )) {
                    relevantChangeDetected = true;
                    break; // No need to check further mutations in this batch
                }
            }
        }
        if (relevantChangeDetected) {
            // console.log('[BotC Tracker - ECG] Relevant DOM mutation detected.');
            debouncedScan(); // Trigger a debounced scan
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    // console.log('[BotC Tracker - ECG] MutationObserver started.');

    // Perform an initial scan when the script loads
    // Use a small delay to allow the page to potentially finish initial rendering
    setTimeout(scanPlayPageForGameInfo, 1000);

    // Optional: Disconnect the observer when the page is unloading
    // window.addEventListener('beforeunload', () => {
    //     observer.disconnect();
    //     console.log('[BotC Tracker - ECG] MutationObserver disconnected.');
    // });

} else {
    console.error('[BotC Tracker - ECG] Target node for MutationObserver not found.');
}
