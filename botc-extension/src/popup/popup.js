// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js
// Globally accessible filter options for the popup
let currentFilterOptions = { officialOnly: false, hideCompleted: false };

document.addEventListener('DOMContentLoaded', async function() {
    // Request current game info from background script
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_GAME_INFO' }, function(response) {
        if (response && response.gameInfo) {
            // Debug logging removed
            window.liveGameInfo = response.gameInfo;
        } else {
            // Debug logging removed
            window.liveGameInfo = null;
        }
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

    window.parseJwt = parseJwt;

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
        // Debug logging removed
    }
    window.setLatestSessionData = setLatestSessionData;

    // Expose latestSessionData globally for online player detection
    window.latestSessionData = latestSessionData;
    // Expose fetchOnlinePlayerIds globally for userManager.js
    window.fetchOnlinePlayerIds = async function() {
    // Debug logging removed
    // Debug logging removed
    if (!window.latestSessionData) {
        if (!window._fetchOnlinePlayerIdsWarned) {
            console.warn('[fetchOnlinePlayerIds] Not available: session data is not present.');
            window._fetchOnlinePlayerIdsWarned = true;
        }
        return new Set();
    }
    // Debug logging removed
    // Debug logging removed
    if (window.userManager && typeof window.userManager.getOnlinePlayerIds === 'function') {
        const ids = window.userManager.getOnlinePlayerIds(window.latestSessionData);
        // Debug logging removed
        // Debug logging removed
        return ids;
    }
    return new Set();
};

    // Function to update the online favorites list UI
    window.updateOnlineFavoritesListFunc = function(playerData, onlinePlayersObject) {
        // Debug logging removed
        
        // CRITICAL DEBUG - Log the entire player data structure
        // Debug logging removed
        // Debug logging removed
        
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
        
        // Debug logging removed
        
        // DEBUG: Print sample of the first few player entries
        // Debug logging removed
        let count = 0;
        for (const playerId in playerData) {
            if (count < 3) {
                // Debug logging removed
                // Check explicitly for the isFavorite property
                // Debug logging removed
                // Debug logging removed
                count++;
            } else {
                break;
            }
        }
        
        // Find all favorite players
        for (const playerId in playerData) {
            // Extra safety check
            if (!playerData[playerId]) continue;
            
            // Check if player is marked as favorite
            const isFavorite = playerData[playerId].isFavorite === true;
            
            if (isFavorite) {
                favoriteCount++;
                // Debug logging removed
                
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
                
                // Debug logging removed
                
                if (isOnline) {
                    // Debug logging removed
                    onlineFavorites.push({
                        id: playerId,
                        name: playerData[playerId].name || playerId,
                        sessionName: sessionName === true ? "Unknown Session" : sessionName,
                        ...playerData[playerId]
                    });
                }
            }
        }
        
        // Debug logging removed
        
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
        // Debug logging removed
    };

    // Global scope for popup lifecycle
    window.currentUserID = null;
    window.liveGameInfo = null; 
    window.playerData = {}; // Initialize playerData

    // Function to parse JWT and extract user ID
    function parseJwt(token) {
        if (!token) {
            console.warn("Attempted to parse a null or empty token.");
            return null;
        }
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) {
                console.error("Invalid JWT: Missing payload.");
                return null;
            }
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedToken = JSON.parse(jsonPayload);
            return decodedToken.id || null; 
        } catch (error) {
            console.error('Failed to parse JWT:', error);
            return null;
        }
    }

    // --- Dark Mode Functionality ---
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Save preference
        const themeToSave = isDark ? 'dark' : 'light';
        chrome.storage.local.set({ theme: themeToSave }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving theme preference:', chrome.runtime.lastError);
            }
        });
    }

    // Helper to wait for userManager to be ready before rendering known players
    function waitForUserManagerAndRenderKnownPlayers(container, searchTerm, maxRetries = 20, delay = 50) {
        if (
            window.userManager &&
            typeof window.userManager.renderKnownPlayers === 'function' &&
            typeof window.userManager.getOnlinePlayerIds === 'function'
        ) {
            window.userManager.renderKnownPlayers(container, searchTerm);
        } else if (maxRetries > 0) {
            setTimeout(() => {
                waitForUserManagerAndRenderKnownPlayers(container, searchTerm, maxRetries - 1, delay);
            }, delay);
        } else {
            console.error('window.userManager.getOnlinePlayerIds is not available after waiting.');
        }
    }

    // --- Search Input Listener (User Management Tab) ---
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => {
                if (document.getElementById('userManagement').classList.contains('active')) {
                    waitForUserManagerAndRenderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
                }
            }, 300);
        });
    } else {
        console.warn('Search input element not found.');
    }

    // --- Initial Async Setup --- 
    try {

        // Load theme preference first (synchronous parts + async storage)
        const themeResult = await new Promise((resolve) => chrome.storage.local.get(['theme'], resolve));
        if (themeResult && themeResult.theme === 'dark') {
            setDarkMode(true);
            if (darkModeToggle) darkModeToggle.checked = true;
        } else {
            setDarkMode(false); 
            if (darkModeToggle) darkModeToggle.checked = false;
        }

        // Fetch Auth Token and parse User ID
        // console.log('[Popup Init] Requesting Auth Token...');
        const tokenResponse = await sendMessagePromise({ type: 'GET_AUTH_TOKEN' });
        if (tokenResponse && tokenResponse.token) {
            // console.log('[Popup Init] Auth Token received.');
            window.currentUserID = parseJwt(tokenResponse.token);
            // console.log('[Popup Init] Parsed User ID:', window.currentUserID);
        } else {
            console.warn('[Popup Init] No Auth Token received from background.');
            window.currentUserID = null;
        }

        // Fetch initial player data using userManager
        try {
            if (window.userManager && typeof window.userManager.getAllPlayerData === 'function') {
                window.playerData = await window.userManager.getAllPlayerData();
                // console.log('[Popup Init] Player data loaded via userManager.getAllPlayerData(). Count:', Object.keys(window.playerData).length);
            } else {
                console.error('[Popup Init] window.userManager.getAllPlayerData is not available. Initializing window.playerData to empty object.');
                window.playerData = {};
            }
        } catch (error) {
            console.error('[Popup Init] Error loading player data via userManager:', error);
            window.playerData = {}; // Ensure playerData is an empty object on error
        }

    } catch (error) {
        console.error('[Popup Init] Error during initial async setup:', error);
        // Ensure defaults are set in case of error
        window.currentUserID = null;
        window.liveGameInfo = null;
        setDarkMode(false); 
        if (darkModeToggle) darkModeToggle.checked = false;
    }

    // Dark Mode Toggle Logic (no longer needs to be conditional on settings modal elements)
    if (darkModeToggle && typeof darkModeToggle.addEventListener === 'function') {
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
        // Debug logging removed
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
                if (!window.latestSessionData) {
                    // No session data available, fetch it first
                    await window.fetchAndDisplaySessions(
                        window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : (id, name, score, notes, isFavorite, callback) => {
                            console.error("userManager.addPlayer is not available. Add operation failed.");
                            if (callback) callback(false);
                        },
                        window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : (player, currentPlayerData) => {
                            console.error("userManager.createUsernameHistoryModal is not available.");
                            return document.createElement('div');
                        },
                        window.updateOnlineFavoritesListFunc,
                        sessionListDiv,
                        { officialOnly: showOfficialOnly },
                        (sessions, finalPlayerData) => {
                            latestSessionData = sessions;
                            window.latestSessionData = sessions;
                            if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                                window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                            }
                        }
                    );
                } else {
                    // Render known players using existing session data
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
                    }
                }
            }
        });
    });

    // Function to refresh the session display
    async function refreshDisplayedSessions() {
        // console.log('[Popup] Refreshing displayed sessions...');
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (sessionListDiv) sessionListDiv.innerHTML = ''; // Clear previous sessions
        if (fetchStatsSpan) fetchStatsSpan.textContent = ''; // Clear previous stats

        // Update currentFilterOptions based on checkbox state
        currentFilterOptions.officialOnly = officialOnlyCheckbox ? officialOnlyCheckbox.checked : false;
        
        // Ensure window.playerData is populated. It should be by the time this is called after initial setup.
        // If called before initial setup, it might be empty, which sessionManager now handles with a warning.
        if (!window.playerData) {
            console.warn('[Popup] refreshDisplayedSessions called but window.playerData is not yet initialized.');
            // Attempt to load it now as a fallback - ideally, popup.js structure ensures it's loaded prior.
            try {
                const playerDataResponse = await sendMessagePromise({ type: 'GET_PLAYER_DATA' });
                window.playerData = (playerDataResponse && playerDataResponse.playerData) ? playerDataResponse.playerData : {};
                // console.log('[Popup] Fallback playerData load completed during refresh.');
            } catch (err) {
                console.error('[Popup] Error during fallback playerData load:', err);
                window.playerData = {}; // Ensure it's at least an empty object
            }
        }

        try {
            const addPlayerFunction = window.userManager && window.userManager.addPlayer ? window.userManager.addPlayer : (id, name, score, notes, isFavorite, callback) => {
                console.error("userManager.addPlayer is not available. Add operation failed.");
                if (callback) callback(false);
            };

            const createUsernameHistoryModalFunction = window.userManager && window.userManager.createUsernameHistoryModal ? window.userManager.createUsernameHistoryModal : (player, currentPlayerData) => {
                console.error("userManager.createUsernameHistoryModal is not available.");
                // Potentially return a dummy element or throw error to indicate failure
                return document.createElement('div'); 
            };
            
            // Check if the function exists on window, if not - try accessing it via a more reliable method
            const fetchAndDisplaySessionsFunc = window.fetchAndDisplaySessions || 
                (typeof sessionManager !== 'undefined' && sessionManager.fetchAndDisplaySessions);
            
            if (!fetchAndDisplaySessionsFunc) {
                throw new Error('fetchAndDisplaySessions function not found. SessionManager may not be fully loaded.');
            }
            
            await fetchAndDisplaySessionsFunc(
                addPlayerFunction, 
                createUsernameHistoryModalFunction, 
                window.updateOnlineFavoritesListFunc,
                sessionListDiv,
                currentFilterOptions,
                (sessions, error) => { // onCompleteCallback
                    if (loadingIndicator) loadingIndicator.style.display = 'none';
                    if (error) {
                        console.error("[Popup] Error reported by fetchAndDisplaySessions:", error);
                        if (sessionListDiv) sessionListDiv.innerHTML = `<p class='error-message'>Failed to display sessions: ${error}</p>`;
                    } else {
                        // console.log("[Popup] Sessions displayed/updated.");
                        latestSessionData = sessions; // Store the latest session data
                        // After sessions are rendered, update the user management tab if it's active
                        // This ensures player statuses (e.g., online) are current
                        if (document.getElementById('userManagement').classList.contains('active') && 
                            window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                            // Use the existing renderKnownPlayers function instead of undefined refreshUserManagementTab
                            window.userManager.renderKnownPlayers(knownPlayersDiv, userSearchInput ? userSearchInput.value : '');
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
                    waitForUserManagerAndRenderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
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
            (sessions, finalPlayerData) => { 
                setLatestSessionData(sessions);
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (sessionListDiv) sessionListDiv.style.display = 'block'; 
                // --- Force re-render of User Management tab if active ---
                const userManagementTab = document.getElementById('userManagement');
                if (userManagementTab && userManagementTab.classList.contains('active')) {
                    waitForUserManagerAndRenderKnownPlayers(knownPlayersDiv, searchInput ? searchInput.value.trim() : '');
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
                window.userManager.editPlayerDetails(null, true, () => {
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
                    } else {
                        console.error("window.userManager.renderKnownPlayers is not available for callback.");
                    }
                });
            } else {
                console.error("window.userManager.editPlayerDetails is not available.");
            }
        });
    } else {
        console.warn('Add Player Manually button not found.');
    }

    // --- Export/Import Buttons ---
    if (exportPlayersButton) {
        exportPlayersButton.addEventListener('click', () => {
            if (typeof window.exportPlayerDataCSV === 'function') { 
                // Assuming exportPlayerDataCSV uses window.playerData internally or we pass it
                // Let's assume it uses window.playerData for now.
                window.exportPlayerDataCSV(window.playerData); 
            } else {
                console.error('Export function (window.exportPlayerDataCSV) not found.'); 
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
                        await window.replaceAllPlayerDataAndSave(parsedData); 
                        
                        // Code that was previously in the inner callback now runs after await
                        importStatusDiv.textContent = 'Player data imported successfully! Reloading list...';
                        if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                            window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                        } else {
                            console.error("window.userManager.renderKnownPlayers is not available for callback after clearing data.");
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
                                console.error("window.userManager.renderKnownPlayers is not available for callback after clearing data.");
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
            // console.log('[Popup] Received LIVE_GAME_INFO_UPDATED:', JSON.stringify(request.payload, null, 2));
            const oldLiveGameInfoString = JSON.stringify(window.liveGameInfo);
            window.liveGameInfo = request.payload;
            const newLiveGameInfoString = JSON.stringify(window.liveGameInfo);

            if (newLiveGameInfoString !== oldLiveGameInfoString) {
                console.log('[Popup] Live game info has changed. Refreshing session display.');
                refreshDisplayedSessions();
            } else {
                console.log('[Popup] Live game info received, but no change detected. No refresh needed.');
            }
            // sendResponse({status: "Popup processed LIVE_GAME_INFO_UPDATED"}); // Optional: send response if needed
            return true; // Keep channel open for potential async response, good practice
        }
        return false; // For synchronous messages or if not handling this specific message type
    });
});