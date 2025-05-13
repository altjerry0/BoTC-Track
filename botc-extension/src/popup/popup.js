// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js

// Globally accessible filter options for the popup
let currentFilterOptions = { officialOnly: false, hideCompleted: false };

document.addEventListener('DOMContentLoaded', async function() {
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
    function showTab(tabId) {
        // Deactivate all tabs
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activate the selected tab
        const selectedTabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const selectedTabContent = document.getElementById(tabId);

        if (selectedTabButton) selectedTabButton.classList.add('active');
        if (selectedTabContent) selectedTabContent.classList.add('active');

        // Load data if switching to user management tab
        if (tabId === 'userManagement') {
            // Call the async render function from userManager.js
            // This function now handles loading data itself.
            // No need to await if we don't need the result immediately.
            if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
            } else {
                console.error("window.userManager.renderKnownPlayers is not available.");
            }
        }
    }

    // --- Helper Functions (Defined Early) ---

    /**
     * Fetches the set of currently online player IDs from the backend.
     * @returns {Promise<Set<string>>} A promise that resolves with a Set of online player IDs.
     */
    async function fetchOnlinePlayerIds() {
        return new Promise((resolve) => {
            // Use sendMessagePromise for built-in error handling
            sendMessagePromise({ action: "fetchSessions" }).then(response => {
                const onlineIds = new Set();
                if (response && response.sessions && Array.isArray(response.sessions)) {
                    response.sessions.forEach(session => {
                        if (session && session.usersAll && Array.isArray(session.usersAll)) {
                            session.usersAll.forEach(user => {
                                if (user && user.id) {
                                    onlineIds.add(user.id.toString());
                                }
                            });
                        }
                    });
                }
                resolve(onlineIds); // Resolve with the Set
            }).catch(error => {
                console.error("Error fetching online player IDs:", error);
                resolve(new Set()); // Resolve with an empty set on error
            });
        });
    }

    /**
     * Updates the list of online favorite players in the UI.
     * @param {Object} playerData - The complete player data object.
     * @param {Object} onlinePlayersMap - Object of online player IDs to their session names.
     */
    function updateOnlineFavoritesList(playerData, onlinePlayersMap) {
        // console.log('[Popup] onlinePlayersMap received (should be object):', onlinePlayersMap, 'Is Map?', onlinePlayersMap instanceof Map); 
        const favoritesListDiv = document.getElementById('onlineFavoritesList');
        const favoritesCountSpan = document.getElementById('onlineFavoritesCount');

        if (!favoritesListDiv || !favoritesCountSpan) {
            console.warn('onlineFavoritesList DIV or onlineFavoritesCount SPAN not found in popup.html.');
            return;
        }

        favoritesListDiv.innerHTML = ''; 
        favoritesCountSpan.textContent = '0'; 

        if (!playerData || Object.keys(playerData).length === 0) {
            favoritesListDiv.textContent = 'No player data available.';
            return;
        }

        const onlineFavorites = [];
        for (const playerId in playerData) {
            if (playerData[playerId].isFavorite && onlinePlayersMap.hasOwnProperty(playerId)) { 
                onlineFavorites.push({
                    ...playerData[playerId],
                    id: playerId, 
                    sessionName: onlinePlayersMap[playerId] 
                });
            }
        }

        favoritesCountSpan.textContent = onlineFavorites.length.toString();

        if (onlineFavorites.length === 0) {
            favoritesListDiv.textContent = 'No favorite players are currently online in fetched sessions.';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('player-list'); 
        onlineFavorites.forEach(player => {
            const li = document.createElement('li');
            li.classList.add('player-item'); 
            li.innerHTML = `
                <span class="player-name">${player.name}</span> 
                <span class="player-rating">(Rating: ${player.score || 'N/A'})</span> - 
                <span class="player-session">Online in: ${player.sessionName}</span>
            `;
            ul.appendChild(li);
        });
        favoritesListDiv.appendChild(ul);
    }

    // Expose functions globally if needed by other scripts
    window.updateOnlineFavoritesListFunc = updateOnlineFavoritesList;
    window.refreshUserManagementTab = refreshUserManagementTab; 
    window.fetchOnlinePlayerIds = fetchOnlinePlayerIds;

    /**
     * Refreshes the content of the User Management tab.
     */
    function refreshUserManagementTab() {
        if (!knownPlayersDiv) {
            console.error('User list container not found for refresh.');
            return;
        }
        // Call the async render function from userManager.js
        // This function now handles loading data and displaying.
        // No need to await if we don't need the result immediately.
        if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
            window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
        } else {
            console.error("window.userManager.renderKnownPlayers is not available.");
        }
    }

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
            
            await window.fetchAndDisplaySessions(
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
                        if (document.getElementById('userManagement').classList.contains('active')) {
                            refreshUserManagementTab();
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

    // Tab Button Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // Search Input Listener (User Management Tab)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // Clear the previous timeout if there is one
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            // Set a new timeout to call renderKnownPlayers after 300ms
            searchTimeout = setTimeout(() => {
                // Check if the user management tab is currently active before re-rendering
                if (document.getElementById('userManagement').classList.contains('active')) {
                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                        window.userManager.renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
                    } else {
                        console.error("window.userManager.renderKnownPlayers is not available.");
                    }
                }
            }, 300); // Debounce time: 300ms
        });
    } else {
        console.warn('Search input element not found.');
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
                latestSessionData = sessions; 
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (sessionListDiv) sessionListDiv.style.display = 'block'; 
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
            ModalManager.showConfirmation(
                "Are you sure you want to delete ALL player data? This action cannot be undone.", 
                (confirmed) => {
                    if (confirmed) {
                        if (window.userManager && typeof window.userManager.replaceAllPlayerDataAndSave === 'function') {
                            window.userManager.replaceAllPlayerDataAndSave({}, (success) => {
                                if (success) {
                                    // console.log('All player data cleared successfully.');
                                    ModalManager.showNotification("All player data has been cleared.", false, 2000);
                                    if (window.userManager && typeof window.userManager.renderKnownPlayers === 'function') {
                                        window.userManager.renderKnownPlayers(knownPlayersDiv, ''); // Re-render with empty search
                                    } else {
                                        console.error("window.userManager.renderKnownPlayers is not available for callback after clearing data.");
                                    }
                                    refreshDisplayedSessions(); // Refresh session display as well
                                } else {
                                    ModalManager.showNotification("Error clearing player data.", true, 3000);
                                }
                            });
                        } else {
                            console.error("window.userManager.replaceAllPlayerDataAndSave is not available.");
                            ModalManager.showNotification("Critical error: Clear data function not found.", true, 3000);
                        }
                    }
                }, 
                {
                }
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