import {
    loadPlayerData,
    savePlayerData,
    getAllPlayerData,
    addPlayer,
    createUsernameHistoryModal,
    updateUsernameHistoryIfNeeded,
    updateSessionHistoryIfNeeded,
    getRatingClass,
    replaceAllPlayerDataAndSave,
    toggleFavoriteStatus,
    deletePlayer,
    handleRefreshUserName,
    updateUsernameHistory,
    editPlayerDetails,
    renderKnownPlayers,
    fetchAndUpdatePlayerName
} from './userManager.js';

import { parseJwt } from '../utils/auth.js';

// Globally accessible filter options for the popup
let currentFilterOptions = { officialOnly: false, hideCompleted: false };

document.addEventListener('DOMContentLoaded', async function() {
    // Request current game info from background script
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_GAME_INFO' }, function(response) {
        if (response && response.gameInfo) {
            window.liveGameInfo = response.gameInfo;
        } else {
            window.liveGameInfo = null;
        }
        // Potentially refresh UI elements that depend on liveGameInfo here
    });

    // Function to parse botc.app authToken and set window.currentUserID
    const setBotcGamePlayerId = (token) => {
        let actualToken = token;
        if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
            actualToken = token.substring(7); // Remove "Bearer " (7 characters)
        }

        const parsedToken = window.parseMyCustomBotcJwt(actualToken);

        if (parsedToken && parsedToken.id) { 
            window.currentUserID = String(parsedToken.id); 
        } else if (parsedToken && parsedToken.user_id) { 
            window.currentUserID = String(parsedToken.user_id); 
        } else if (parsedToken && parsedToken.sub) { 
            window.currentUserID = String(parsedToken.sub); 
        } else {
            window.currentUserID = null;
            if (actualToken) { // Only warn if there was a token to parse
                console.warn('[Popup] Failed to parse botc.app authToken or find ID field (id, user_id, sub). Token payload:', parsedToken);
            }
        }
        // If UI elements depend on currentUserID, refresh them here
    };

    // Attempt to load botc.app authToken from storage and set currentUserID (for game context)
    chrome.storage.local.get('authToken', function(data) {
        if (data.authToken) {
            setBotcGamePlayerId(data.authToken);
        } else {
            window.currentUserID = null; // Ensure it's null if no token
        }
    });

    // Listen for botc.app token updates from background script
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.type === 'TOKEN_ACQUIRED' || message.type === 'TOKEN_UPDATED') { // Listen for token updates
            setBotcGamePlayerId(message.token);
        }
        return false; 
    });

    // Assign core utility functions to window object IMMEDIATELY
    // so they are available even if subsequent async operations fail.
    window.sendMessagePromise = (message) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    // Don't reject if the error is expected (like popup closed before response)
                    // but log it as a warning.
                    if (chrome.runtime.lastError.message.includes("Extension context invalidated") ||
                        chrome.runtime.lastError.message.includes("Could not establish connection") || 
                        chrome.runtime.lastError.message.includes("message port closed")) {
                         console.warn(`sendMessagePromise: Ignoring expected error - ${chrome.runtime.lastError.message}`);
                         // Resolve indicating potential issue but not a hard error
                         resolve({ error: chrome.runtime.lastError.message, potentiallyClosed: true }); 
                    } else {
                        console.error("sendMessagePromise Runtime Error:", chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError);
                    }
                } else {
                    resolve(response);
                }
            });
        });
    };

    // Button and Controls References
    const fetchButton = document.getElementById('fetchButton');
    const officialOnlyCheckbox = document.getElementById('officialOnlyCheckbox');
    const searchInput = document.getElementById('userSearch'); 
    const exportPlayersButton = document.getElementById('export-players-button');
    const importPlayersButton = document.getElementById('import-players-button');
    const importFileInput = document.getElementById('import-file-input');
    const importStatusDiv = document.getElementById('import-status');
    const addPlayerButton = document.getElementById('add-player-button'); 
    const clearAllPlayerDataButton = document.getElementById('clear-all-player-data-button'); 
    const darkModeToggle = document.getElementById('darkModeToggle');
    const sessionListDiv = document.getElementById('sessionList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const knownPlayersDiv = document.getElementById('knownPlayers');
    const onlineFavoritesListDiv = document.getElementById('onlineFavoritesList');
    const onlineFavoritesCountSpan = document.getElementById('onlineFavoritesCount');
    const openInTabButton = document.getElementById('open-in-tab-btn');
    const fetchStatsSpan = document.getElementById('fetchStats');

    // Tab References
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Content Area References

    // State
    let latestSessionData = null; 
    let showOfficialOnly = false; 
    let searchTimeout = null;

    // Utility to keep both variables in sync
    function setLatestSessionData(sessions) {
        latestSessionData = sessions;
        window.latestSessionData = sessions;
    }
    window.setLatestSessionData = setLatestSessionData;

    // Expose latestSessionData globally for online player detection
    window.latestSessionData = latestSessionData;
    // Expose fetchOnlinePlayerIds globally for userManager.js
    // Global function to get online player IDs from latest session data
    window.fetchOnlinePlayerIds = async function() {
        // Early validation of session data
        if (!window.latestSessionData?.length || !Array.isArray(window.latestSessionData)) {

            return new Set();
        }

        // Get online IDs using userManager if available
        if (window.userManager?.getOnlinePlayerIds) {
            const ids = window.userManager.getOnlinePlayerIds(window.latestSessionData);

            return ids;
        }

        // Fallback: process session data directly if userManager not available
        const onlineIds = new Set();
        window.latestSessionData.forEach(session => {
            session.usersAll?.forEach(user => {
                if (user?.id && user.isOnline) {
                    onlineIds.add(user.id.toString());
                }
            });
        });
        return onlineIds;
    };

    // Function to update the online favorites list UI
    window.updateOnlineFavoritesListFunc = function(playerData, onlinePlayersObject) {
        const onlineFavoritesListDiv = document.getElementById('onlineFavoritesList');
        const onlineFavoritesCountSpan = document.getElementById('onlineFavoritesCount');
        
        if (!onlineFavoritesListDiv || !onlineFavoritesCountSpan) {
            console.warn('[updateOnlineFavoritesListFunc] Required DOM elements not found');
            return;
        }
        
        // Clear existing list
        onlineFavoritesListDiv.innerHTML = '';
        
        // Get favorite players who are currently online
        let onlineFavorites = [];
        let favoriteCount = 0;
        let onlineCount = 0;
        let onlinePlayersByNumericId = {};
        
        // Check if playerData is valid
        if (!playerData || typeof playerData !== 'object') {
            console.error('[updateOnlineFavoritesListFunc] playerData is invalid:', playerData);
            onlineFavoritesListDiv.innerHTML = '<p>Error: Player data unavailable</p>';
            return;
        }
        
        // First, restructure the onlinePlayersObject for easier matching
        // Create a lookup by numeric-only IDs
        if (onlinePlayersObject && typeof onlinePlayersObject === 'object') {
            for (const onlinePlayerId in onlinePlayersObject) {
                // Store both the original ID format and a numeric-only version
                const numericId = onlinePlayerId.replace(/\D/g, '');
                onlinePlayersByNumericId[numericId] = onlinePlayersObject[onlinePlayerId];
                onlineCount++;
            }
        } else {
            console.warn('[updateOnlineFavoritesListFunc] onlinePlayersObject is invalid or empty');
        }
        
        // Find all favorite players
        for (const playerId in playerData) {
            // Extra safety check
            if (!playerData[playerId]) continue;
            
            // Check if player is marked as favorite
            const isFavorite = playerData[playerId].isFavorite === true;
            
            if (isFavorite) {
                favoriteCount++;
                
                // Get the numeric version of the player ID
                const numericPlayerId = playerId.replace(/\D/g, '');
                
                // Check if the player is online using both original and numeric formats
                const isOnlineExact = !!onlinePlayersObject[playerId];
                const isOnlineNumeric = !!onlinePlayersByNumericId[numericPlayerId];
                const isOnline = isOnlineExact || isOnlineNumeric;
                
                // Get session name from whichever match worked
                let sessionName = null;
                if (isOnlineExact) {
                    sessionName = onlinePlayersObject[playerId];
                } else if (isOnlineNumeric) {
                    sessionName = onlinePlayersByNumericId[numericPlayerId];
                }
                
                if (isOnline) {
                    onlineFavorites.push({
                        id: playerId,
                        name: playerData[playerId].name || playerId,
                        sessionName: sessionName === true ? "Unknown Session" : sessionName,
                        ...playerData[playerId]
                    });
                }
            }
        }
        
        // Update count display
        onlineFavoritesCountSpan.textContent = onlineFavorites.length;
        
        // Populate the list
        if (onlineFavorites.length > 0) {
            // Clear previous content
            onlineFavoritesListDiv.innerHTML = '';
            
            // Create simple list of online favorite players
            onlineFavorites.forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'online-favorite-item';
                
                // Create main player name span
                const nameSpan = document.createElement('span');
                nameSpan.className = 'favorite-player-name';
                nameSpan.textContent = player.name;
                
                // Create session name span
                const sessionSpan = document.createElement('span');
                sessionSpan.className = 'favorite-player-session';
                sessionSpan.textContent = player.sessionName ? ` (${player.sessionName})` : '';
                sessionSpan.style.fontSize = '0.9em';
                sessionSpan.style.color = 'var(--text-secondary-color, #777)';
                sessionSpan.style.fontStyle = 'italic';
                
                // Add name and session to the player item
                playerItem.appendChild(nameSpan);
                playerItem.appendChild(sessionSpan);
                playerItem.style.cursor = 'pointer'; // Show it's clickable
                
                // Add click handler to navigate to the session when clicked
                playerItem.addEventListener('click', function() {
                    let url;
                    // If session name is available and not just 'true' or 'Unknown Session'
                    if (player.sessionName && player.sessionName !== true && player.sessionName !== 'Unknown Session') {
                        // Convert the session name to a URL-friendly format and join by session name
                        const encodedSessionName = encodeURIComponent(player.sessionName.toLowerCase());
                        url = `https://botc.app/join/${encodedSessionName}`;
                    } else {
                        // URL = Nothing
                        url = ``;
                    }
                    window.open(url, '_blank');
                });
                
                onlineFavoritesListDiv.appendChild(playerItem);
            });
        } else {
            onlineFavoritesListDiv.innerHTML = '<p>No favorite players currently online.</p>';
        }
    };

    // Global scope for popup lifecycle
    window.currentUserID = null; // This will be the botc.app game player ID
    window.liveGameInfo = null; 
    window.playerData = {}; // Initialize playerData

    // --- Dark Mode Functionality ---
    function setDarkMode(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        if (darkModeToggle) {
            darkModeToggle.checked = isDark;
        }
        chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    }

    // Load saved theme preference or default to dark mode
    chrome.storage.local.get('theme', function(data) {
        if (data.theme === 'dark') {
            setDarkMode(true);
        } else if (data.theme === 'light') {
            setDarkMode(false);
        } else {
            // Default to dark mode if no theme is set
            setDarkMode(true);
        }
    });

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            setDarkMode(this.checked);
        });
    } else {
        console.error('darkModeToggle is NOT valid or addEventListener is missing after UI change. This should not happen.');
        // Fallback or further error logging if needed, but the element should exist directly in the header now.
    }

    // --- Proceed with rest of initialization AFTER async setup ---

    // Function to show a specific tab
    function showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab.id === tabName || (tabName === 'account' && tab.id === 'accountTab')) {
                tab.style.display = 'block';
                tab.classList.add('active');
            } else {
                tab.style.display = 'none';
                tab.classList.remove('active');
            }
        });

        if (tabName === 'account') {
            // Load the account tab script when switching to that tab
            loadAccountTabScript(() => {
                if (window.initAccountTab) window.initAccountTab();
            });
        }
    }

    // --- Dynamic loader for Account Tab ---
    let accountTabLoaded = false;
    function loadAccountTabScript(callback) {
        // Check if already loaded to prevent duplicate loading
        if (accountTabLoaded || document.querySelector('script[src="accountTab.js"]')) {
            // Skip loading if already loaded
            accountTabLoaded = true;
            if (callback) callback();
            return;
        }
        
        // Load the script dynamically
        const script = document.createElement('script');
        script.src = 'accountTab.js';
        script.onload = () => {
            accountTabLoaded = true;
            if (callback) callback();
        };
        document.head.appendChild(script);
    }

    // Tab Button Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', async () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.dataset.tab;
            showTab(tabName);
            // Render known players when switching to userManagement tab
            if (tabName === 'userManagement') {
                // Handle user management tab switching
                if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                    // Always attempt to render known players first - this shouldn't depend on session data
                    window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                    
                    // Attempt to fetch session data in the background for online status, but don't block the UI
                    if (!window.latestSessionData) {
                        // No session data available, fetch it but don't block user management rendering
                        window.fetchAndDisplaySessions(
                            addPlayer,
                            createUsernameHistoryModal,
                            window.updateOnlineFavoritesListFunc,
                            sessionListDiv,
                            { officialOnly: showOfficialOnly },
                            (sessionsData, errorData) => { 
                                if (loadingIndicator) loadingIndicator.style.display = 'none';
                                if (errorData) {
                                    console.warn("[Popup] Error fetching sessions: " + errorData + ". User management will continue with limited functionality.");
                                    if (sessionListDiv) sessionListDiv.innerHTML = `<p class='error-message'>Failed to display sessions: ${errorData}</p>`;
                                } else {
                                    // Success path for session data
                                    latestSessionData = sessionsData;
                                    window.latestSessionData = sessionsData; // Update global
                                    
                                    // If user management tab is still active, refresh it with online status
                                    if (document.getElementById('userManagement').classList.contains('active')) {
                                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                                    }
                                }
                            }
                        );
                    }
                } else {
                    console.error("User manager or renderKnownPlayers function not available.");
                }
            }
        });
    });

    // Function to refresh the session display
    async function refreshDisplayedSessions() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (sessionListDiv) sessionListDiv.innerHTML = ''; // Clear previous sessions
        if (fetchStatsSpan) fetchStatsSpan.textContent = ''; // Clear previous stats

        // Update currentFilterOptions based on checkbox state
        currentFilterOptions.officialOnly = officialOnlyCheckbox ? officialOnlyCheckbox.checked : false;
        
        // Ensure window.playerData is populated. It should be by the time this is called after initial setup.
        // If called before initial setup, it might be empty, which sessionManager now handles with a warning.
        // MODIFIED Condition: Check if playerData is falsy OR an empty object.
        if (!window.playerData || Object.keys(window.playerData).length === 0) { 
            console.warn('[Popup] refreshDisplayedSessions: window.playerData is empty or not initialized. Attempting fallback load.');
            // Attempt to load it now as a fallback - ideally, popup.js structure ensures it's loaded prior.
            try {
                const playerDataResponse = await sendMessagePromise({ type: 'GET_PLAYER_DATA' });
                window.playerData = (playerDataResponse && playerDataResponse.playerData) ? playerDataResponse.playerData : {};
            } catch (err) {
                console.error('[Popup] Error during fallback playerData load:', err);
                window.playerData = {}; // Ensure it's at least an empty object
            }
        }

        try {
            const addPlayerFunction = addPlayer;
            const createUsernameHistoryModalFunction = createUsernameHistoryModal;
            
            // Check if the function exists on window, if not - try accessing it via a more reliable method
            const fetchAndDisplaySessionsFunc = window.fetchAndDisplaySessions || 
                (typeof sessionManager !== 'undefined' && sessionManager.fetchAndDisplaySessions);
            
            if (!fetchAndDisplaySessionsFunc) {
                throw new Error('fetchAndDisplaySessions function not found. SessionManager may not be fully loaded.');
            }
            
            await fetchAndDisplaySessionsFunc(
                addPlayer,
                createUsernameHistoryModal,
                window.updateOnlineFavoritesListFunc,
                sessionListDiv,
                currentFilterOptions,
                (sessionsData, errorData) => { 
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    if (errorData) {
                        console.error("[Popup] Error reported by fetchAndDisplaySessions (main load):", errorData);
                        if (sessionListDiv) sessionListDiv.innerHTML = `<p class='error-message'>Failed to display sessions: ${errorData}</p>`;
                    } else {
                        // Success path for main load
                        latestSessionData = sessionsData;
                        window.latestSessionData = sessionsData; // Update global
                        if (document.getElementById('userManagement').classList.contains('active') && 
                            window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                            const knownPlayersDiv = document.getElementById('knownPlayers');
                            const searchInput = document.getElementById('userSearch');
                            window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                        } else if (document.getElementById('userManagement').classList.contains('active')) {
                            console.error("User manager or renderKnownPlayers function not available (main load).");
                        }
                    }
                }
            );
        } catch (error) {
            console.error("[Popup] Critical error calling fetchAndDisplaySessions:", error);
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (sessionListDiv) sessionListDiv.innerHTML = `<p class='error-message'>A critical error occurred: ${error.message}</p>`;
        }
    }

    // --- Central UI Refresh Function ---
    async function refreshAllViews(initiatingAction) {
        console.log(`[Popup] refreshAllViews called, initiated by: ${initiatingAction || 'unknown'}`);
        if (!window.userManager || typeof window.userManager.getAllPlayerData !== 'function' ||
            typeof window.userManager.renderKnownPlayers !== 'function') {
            console.error("[Popup] User manager not fully available for refreshAllViews.");
            return;
        }

        try {
            const currentPlayerData = await window.userManager.getAllPlayerData();
            window.playerData = currentPlayerData; // EXPLICITLY UPDATE window.playerData

            const onlinePlayerIds = await window.fetchOnlinePlayerIds(); // Returns a Set of IDs

            // Reconstruct onlinePlayersObject (maps ID to session name or true) for favorites list
            const onlinePlayersObjectForFavorites = {};
            if (window.latestSessionData && onlinePlayerIds.size > 0) {
                window.latestSessionData.forEach(session => {
                    session.usersAll?.forEach(user => {
                        if (user?.id && onlinePlayerIds.has(user.id.toString())) {
                            onlinePlayersObjectForFavorites[user.id.toString()] = session.name || true;
                        }
                    });
                });
            }

            // 1. Refresh Known Players list (User Management tab)
            // Check if the User Management tab is active before re-rendering it.
            const userManagementTab = document.getElementById('userManagement');
            const knownPlayersDiv = document.getElementById('knownPlayers'); // ensure it's defined
            const searchInput = document.getElementById('userSearch'); // ensure it's defined

            if (userManagementTab && userManagementTab.classList.contains('active') && knownPlayersDiv) {
                console.log("[Popup] Refreshing Known Players list.");
                // renderKnownPlayers expects: container, searchTerm, playerData, onlinePlayerIds (Set), createUsernameHistoryModalFunc, refreshCallback
                // We need to ensure createUsernameHistoryModal and a suitable refresh callback (e.g., refreshAllViews itself, or a limited version) are passed if needed by displayKnownPlayers' actions.
                // For now, assuming renderKnownPlayers handles its own internal action callbacks or we address that separately.
                window.userManager.renderKnownPlayers(
                    knownPlayersDiv, 
                    searchInput ? searchInput.value.trim() : '', 
                    currentPlayerData, 
                    onlinePlayerIds,
                    window.userManager.createUsernameHistoryModal, // Pass the actual function
                    refreshAllViews // Pass refreshAllViews for actions within player cards
                );
            }

            // 2. Refresh Online Favorites list
            if (typeof window.updateOnlineFavoritesListFunc === 'function') {
                console.log("[Popup] Refreshing Online Favorites list.");
                window.updateOnlineFavoritesListFunc(currentPlayerData, onlinePlayersObjectForFavorites);
            }

            // 3. Refresh Sessions list
            if (typeof refreshDisplayedSessions === 'function') {
                console.log("[Popup] Refreshing Sessions list.");
                // Consider if refreshDisplayedSessions needs currentPlayerData for player-specific highlights/info in session cards
                await refreshDisplayedSessions(); 
            }
            console.log("[Popup] refreshAllViews completed.");
        } catch (error) {
            console.error("[Popup] Error during refreshAllViews:", error);
        }
    }
    window.refreshAllViews = refreshAllViews; // Expose globally if needed by other modules or for easier debugging

    // --- Targeted UI Refresh Function (excluding full session list re-render) ---
    async function refreshDependentViews(updatedPlayerId) {
        try {
            console.log(`[Popup] Refreshing dependent views for player ID: ${updatedPlayerId}`);
            const currentPlayerData = await window.userManager.getAllPlayerData();
            // window.playerData in popup.js scope is updated by userManager.getAllPlayerData if it's designed to do so,
            // or we can set it explicitly: window.playerData = currentPlayerData;

            const onlinePlayerIds = await window.fetchOnlinePlayerIds();

            // Prepare onlinePlayersObject for favorites list
            let onlinePlayersObjectForFavorites = {};
            if (window.latestSessionData && Array.isArray(window.latestSessionData)) {
                window.latestSessionData.forEach(session => {
                    session.usersAll?.forEach(user => {
                        if (user?.id && onlinePlayerIds.has(user.id.toString())) {
                            onlinePlayersObjectForFavorites[user.id.toString()] = session.name || true;
                        }
                    });
                });
            }

            // 1. Refresh Online Favorites list
            if (typeof window.updateOnlineFavoritesListFunc === 'function') {
                console.log("[Popup] Refreshing Online Favorites list (targeted).");
                window.updateOnlineFavoritesListFunc(currentPlayerData, onlinePlayersObjectForFavorites);
            }

            // 2. Refresh Known Players list (User Management tab, if active)
            const userManagementTab = document.getElementById('userManagement');
            const knownPlayersDiv = document.getElementById('knownPlayers'); // ensure it's defined
            const searchInput = document.getElementById('userSearch'); // ensure it's defined

            if (userManagementTab && userManagementTab.classList.contains('active') && knownPlayersDiv) {
                console.log("[Popup] Refreshing Known Players list (targeted).");
                // Note: renderKnownPlayers might need the updatedPlayerData directly
                window.userManager.renderKnownPlayers(
                    knownPlayersDiv,
                    searchInput ? searchInput.value.trim() : '',
                    currentPlayerData, // Pass the fresh data
                    onlinePlayerIds,
                    window.userManager.createUsernameHistoryModal,
                    window.refreshAllViews // Actions on these cards still use full refresh for now
                );
            }
            console.log(`[Popup] refreshDependentViews for player ID: ${updatedPlayerId} completed.`);
        } catch (error) {
            console.error(`[Popup] Error during refreshDependentViews for player ID: ${updatedPlayerId}:`, error);
        }
    }
    window.refreshDependentViews = refreshDependentViews; // Expose globally

    // --- Initialize Event Listeners ---

    // Search Input Listener (User Management Tab)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // Clear the previous timeout if there is one
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => {
                if (document.getElementById('userManagement').classList.contains('active')) {
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
                    } else {
                        console.error("User manager or renderKnownPlayers function not available for search.");
                    }
                }
            }, 300);
        });
    }

    fetchButton.addEventListener('click', async () => {
        if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Fetching sessions...</p>';
        }
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (sessionListDiv) sessionListDiv.style.display = 'none'; 

        await window.fetchAndDisplaySessions(
            window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : (id, name, score, notes, isFavorite, callback) => {
                console.error("userManager.addPlayer is not available. Add operation failed.");
                if (callback) callback(false);
            },
            window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : (player, currentPlayerData) => {
                console.error("userManager.createUsernameHistoryModal is not available.");
                // Potentially return a dummy element or throw error to indicate failure
                return document.createElement('div'); 
            },
            window.updateOnlineFavoritesListFunc,
            sessionListDiv, 
            { officialOnly: showOfficialOnly }, 
            (sessionsData, errorData) => { 
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (sessionListDiv) sessionListDiv.style.display = 'block'; 
                // --- Force re-render of User Management tab if active ---
                const userManagementTab = document.getElementById('userManagement');
                if (userManagementTab && userManagementTab.classList.contains('active')) {
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                    } else {
                        console.error("User manager or renderKnownPlayers function not available on fetch complete.");
                    }
                }
            }
        );
    });

    // --- Filter Checkbox Listeners ---

    // Helper function to re-render sessions with current filters
    function applySessionFilters() {
        if (!window.renderSessions) {
            console.error('renderSessions function not found. Cannot re-render with filters.');
            if (sessionListDiv) sessionListDiv.innerHTML = '<p class="error-message">Error applying filter.</p>';
            return;
        }
        if (!latestSessionData) {
             console.warn('No session data available to filter.');
             // Optionally show a message or just do nothing
             if (sessionListDiv) sessionListDiv.innerHTML = '<p>Fetch session data first to apply filters.</p>';
             return;
        }

        // Update global filter options based on current checkbox states
        currentFilterOptions.officialOnly = officialOnlyCheckbox ? officialOnlyCheckbox.checked : false;

        // Display a temporary message while re-rendering
        if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Applying filter...</p>';
        }

        // Call renderSessions with existing data and updated filters
        window.renderSessions(
            latestSessionData, 
            window.playerData, // Assumes playerData is up-to-date
            sessionListDiv, 
            currentFilterOptions, // Pass the updated filter object
            window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : (id, name, score, notes, isFavorite, callback) => {
                console.error("userManager.addPlayer is not available. Add operation failed.");
                if (callback) callback(false);
            },
            window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : (player, currentPlayerData) => {
                console.error("userManager.createUsernameHistoryModal is not available.");
                // Potentially return a dummy element or throw error to indicate failure
                return document.createElement('div'); 
            }
        );
    }

    // Listener for 'Official Games Only' checkbox
    if (officialOnlyCheckbox) {
        officialOnlyCheckbox.addEventListener('change', applySessionFilters);
    } else {
        console.warn("'officialOnlyCheckbox' not found.");
    }

    // --- End Filter Checkbox Listeners ---


    // Add Player Manually Button (Handles both Add and Update via window.addPlayer)
    if (addPlayerButton) {
        addPlayerButton.innerHTML = '<img src="../icons/addbutton.svg" alt="Add Player" class="button-icon" /> Add';
        addPlayerButton.title = 'Add Player Manually'; 

        addPlayerButton.addEventListener('click', async () => {
            if (window.userManager && typeof window.userManager.editPlayerDetails === 'function') {
                window.userManager.editPlayerDetails(null, true, window.refreshAllViews);
            } else {
                console.error("window.userManager.editPlayerDetails is not available.");
            }
        });
    } else {
        console.warn('Add Player Manually button not found.');
    }

    // --- Export/Import Buttons ---
    if (exportPlayersButton) {
        exportPlayersButton.addEventListener('click', async () => {
            if (typeof window.userManager?.loadPlayerData === 'function' && typeof window.exportPlayerDataCSV === 'function') {
                try {
                    const latestPlayerData = await window.userManager.loadPlayerData();
                    if (latestPlayerData && Object.keys(latestPlayerData).length > 0) {
                        window.exportPlayerDataCSV(latestPlayerData);
                    } else {
                        console.warn('[Popup] Export button clicked, but no player data to export.');
                        ModalManager.showAlert('No Data', 'There is no player data to export.');
                    }
                } catch (err) {
                    console.error('[Popup] Failed to load player data for export:', err);
                    ModalManager.showAlert('Error', 'Failed to load player data for export.');
                }
            } else {
                console.error('Export function (window.exportPlayerDataCSV) or userManager.loadPlayerData not found.');
                ModalManager.showAlert('Error', 'Export functionality is currently unavailable.');
            }
        });
    } else {
        console.warn('Export players button not found.');
    }

    if (importPlayersButton && importFileInput) {
        importPlayersButton.addEventListener('click', () => {
            importFileInput.click(); // Trigger the hidden file input
        });

        importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Make the successCallback async to use await inside
                const successCallback = async (parsedData) => { 
                    try {
                        // Await the async function instead of passing a callback
                        await window.userManager.replaceAllPlayerDataAndSave(parsedData); 
                        
                        // Code that was previously in the inner callback now runs after await
                        importStatusDiv.textContent = 'Player data imported successfully! Reloading list...';
                        if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                            window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                        } else {
                            console.error("User manager or renderKnownPlayers function not available for callback after clearing data.");
                        }
                        refreshDisplayedSessions(); // Refresh session display as well
                    } catch (error) {
                        console.error('Error processing imported data:', error);
                        importStatusDiv.textContent = 'Error saving imported data. Check console.';
                        importStatusDiv.className = 'import-status-message error';
                        importStatusDiv.style.display = 'block';
                    }
                };
                window.importPlayerDataCSV(file, successCallback, (message, isError) => {
                    importStatusDiv.textContent = message;
                    importStatusDiv.className = `import-status-message ${isError ? 'error' : 'success'}`;
                    importStatusDiv.style.display = 'block';
                }); 
            } else {
                importStatusDiv.textContent = 'No file selected.';
                importStatusDiv.className = 'import-status-message error';
                importStatusDiv.style.display = 'block';
            }
        });
    } else {
        console.warn('Import Players button, file input, or status div not found.');
    }

    if (clearAllPlayerDataButton) {
        clearAllPlayerDataButton.addEventListener('click', function() {
            console.log('Clear all player data button clicked');
            
            // Define confirm and cancel handlers first
            const handleConfirm = () => {
                console.log('Clear data confirmed by user');
                if (window.userManager && typeof window.userManager.replaceAllPlayerDataAndSave === 'function') {
                    console.log('Calling replaceAllPlayerDataAndSave');
                    window.userManager.replaceAllPlayerDataAndSave({}, (success) => {
                        if (success) {
                            console.log('All player data cleared successfully.');
                            ModalManager.showNotification("Success", "All player data has been cleared.", 2000);
                            if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                                window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                            } else {
                                console.error("User manager or renderKnownPlayers function not available for callback after clearing data.");
                            }
                            refreshDisplayedSessions(); // Refresh session display as well
                        } else {
                            ModalManager.showNotification("Error", "Failed to clear player data.", 3000);
                        }
                    });
                } else {
                    console.error("window.userManager.replaceAllPlayerDataAndSave is not available.");
                    ModalManager.showNotification("Critical Error", "Clear data function not found. Please reload the extension.", 3000);
                }
            };
            
            const handleCancel = () => {
                console.log('Clear data cancelled by user');
            };

            // Call the confirm modal with our properly defined handlers
            ModalManager.showConfirm(
                "Clear Player Data",
                "Are you sure you want to delete ALL player data? This action cannot be undone.", 
                handleConfirm, 
                handleCancel
            );
        });
    } else {
        console.warn('Clear all player data button not found.');
    }

    // --- Initialization Sequence ---

    // Initial setup
    refreshDisplayedSessions();

    // Show the default tab (sessions)
    showTab('sessions'); 

    // --- Event Listener for Open in Tab --- 
    const openInTabBtn = document.getElementById('open-in-tab-btn');
    if (openInTabBtn) {
        openInTabBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("src/popup/popup.html") });
        });
    } else {
        console.error('Could not find the #open-in-tab-btn element.');
    }

    // Add listener for live game info updates from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'LIVE_GAME_INFO_UPDATED') {
            const oldLiveGameInfoString = JSON.stringify(window.liveGameInfo);
            window.liveGameInfo = request.payload;
            const newLiveGameInfoString = JSON.stringify(window.liveGameInfo);

            if (newLiveGameInfoString !== oldLiveGameInfoString) {
                console.log('Live game info has changed. Refreshing session display.');
                refreshDisplayedSessions();
            } else {
                console.log('Live game info received, but no change detected. No refresh needed.');
            }
            // sendResponse({status: "Popup processed LIVE_GAME_INFO_UPDATED"}); // Optional: send response if needed
            return true; // Keep channel open for potential async response, good practice
        }
        return false; // For synchronous messages or if not handling this specific message type
    });
});

// Helper function to parse JWT
window.parseMyCustomBotcJwt = function(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const base64Url = parts[1];
        
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Pad base64 string if necessary
        switch (base64.length % 4) {
            case 2: base64 += '=='; break;
            case 3: base64 += '='; break;
        }

        const decodedAtob = atob(base64); // Use atob for base64 decoding
        // Convert binary string to percent-encoded characters
        const jsonPayload = decodeURIComponent(decodedAtob.split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const parsed = JSON.parse(jsonPayload);
        return parsed; // Ensure it returns the whole parsed object
    } catch (e) {
        console.error("[Popup] Failed to parse JWT. Token:", token, "Error:", e.message);
        return null;
    }
};