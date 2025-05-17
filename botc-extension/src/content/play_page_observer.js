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

/* COMMENTED OUT - MAY 2025: We believe this functionality is no longer needed as private games are visible in the sessions endpoint

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
*/

/* COMMENTED OUT - MAY 2025: We believe this functionality is no longer needed as private games are visible in the sessions endpoint

// Function to scan the DOM for player, storyteller, and spectator IDs with improved categorization
function scanPlayPageForGameInfo() {
    // console.log('[BotC Tracker - ECG] Scanning Play Page DOM...');
    
    // Create separate collections for each role type
    const activePlayerIds = new Set();
    const storytellerIds = new Set();
    const spectatorIds = new Set();
    const allUserIds = new Set(); // Track all users regardless of role
    
    // Extract user ID from an element's class
    function extractUserId(element) {
        if (!element || typeof element.className !== 'string') return null;
        const match = element.className.match(/\bid-(\d{10,})\b/); // Match 'id-' followed by 10+ digits
        return match && match[1] ? match[1] : null;
    }
*/
    
/*  COMMENTED OUT - Continued from above
    // --- Find active players ---
    const playerElements = document.querySelectorAll('.player[class*=" id-"]:not(.spectator)');
    playerElements.forEach(el => {
        const userId = extractUserId(el);
        if (userId) {
            activePlayerIds.add(userId);
            allUserIds.add(userId);
        }
    });
    
    // --- Find all storytellers (might be multiple) ---
    const storytellerElements = document.querySelectorAll('.storyteller[class*=" id-"]');
    storytellerElements.forEach(el => {
        const userId = extractUserId(el);
        if (userId) {
            storytellerIds.add(userId);
            allUserIds.add(userId);
        }
    });
    
    // --- Find spectators ---
    const spectatorElements = document.querySelectorAll('.player.spectator[class*=" id-"], .spectator[class*=" id-"]');
    spectatorElements.forEach(el => {
        const userId = extractUserId(el);
        if (userId) {
            spectatorIds.add(userId);
            allUserIds.add(userId);
        }
    });

    // Create detailed game info object with proper categorization
    const gameInfo = {
        allUserIds: Array.from(allUserIds),          // All users in the game
        activePlayerIds: Array.from(activePlayerIds), // Only active players
        storytellerIds: Array.from(storytellerIds),   // All storytellers (could be multiple)
        spectatorIds: Array.from(spectatorIds),       // Spectators
        // Keep storytellerId for backwards compatibility
        storytellerId: storytellerIds.size > 0 ? Array.from(storytellerIds)[0] : null
    };

    // Only send message if we found any users
    if (gameInfo.allUserIds.length > 0) {
        // console.log('[BotC Tracker - ECG] Found Game Info:', gameInfo);
        safeSendMessage({ type: 'CURRENT_GAME_INFO', payload: gameInfo });
    } else {
        // console.log('[BotC Tracker - ECG] No players/storytellers/spectators found in DOM.');
        // Send null if no game is detected (e.g., user left the game)
        safeSendMessage({ type: 'CURRENT_GAME_INFO', payload: null });
    }
} // End of scanPlayPageForGameInfo
*/

/* COMMENTED OUT - MAY 2025: We believe this functionality is no longer needed as private games are visible in the sessions endpoint

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

*/

// Just a placeholder to indicate this script is still loaded but all functionality is commented out
console.log('[BotC Tracker - ECG] Play Page Observer disabled - testing if this functionality is needed');

