// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js

// Globally accessible filter options for the popup
let currentFilterOptions = { officialOnly: false };

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

        // Player data might be needed for other UI elements or checks
        const playerDataResponse = await sendMessagePromise({ type: 'GET_PLAYER_DATA' });
        window.playerData = (playerDataResponse && playerDataResponse.playerData) ? playerDataResponse.playerData : {};

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
            loadPlayerData(playerData => {
                displayKnownPlayers(
                    knownPlayersDiv, 
                    searchInput.value.trim(), 
                    playerData, 
                    latestSessionData, 
                    createUsernameHistoryModal,
                    refreshUserManagementTab
                );
            });
        }
    }

    // --- Helper Functions (Defined Early) ---

    /**
     * Fetches the set of currently online player IDs from the backend.
     * @param {function(Set<string>)} callback - Receives a Set of online player IDs.
     */
    function fetchOnlinePlayerIds(callback) {
        chrome.runtime.sendMessage({ action: "fetchSessions" }, (response) => {
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
            } else {
                console.warn("No sessions found or invalid format when fetching online IDs.", response);
            }
            callback(onlineIds);
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

    /**
     * Refreshes the content of the User Management tab.
     */
    function refreshUserManagementTab() {
        if (!knownPlayersDiv) {
            console.error('User list container not found for refresh.');
            return;
        }
        knownPlayersDiv.innerHTML = '<p class="loading-message">Loading player data...</p>'; 

        if (typeof window.loadPlayerData === 'function' && typeof window.displayKnownPlayers === 'function') {
            fetchOnlinePlayerIds(onlinePlayerIds => {
                window.loadPlayerData((playerData) => {
                    window.displayKnownPlayers(
                        knownPlayersDiv,
                        searchInput.value.trim(), 
                        playerData,
                        latestSessionData, 
                        createUsernameHistoryModal, 
                        refreshUserManagementTab
                    );
                });
            });
       
        } else {
            console.error('Required functions (loadPlayerData or displayKnownPlayers) not found on window.');
            knownPlayersDiv.innerHTML = '<p class="error-message">Error loading player management functions.</p>';
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
        currentFilterOptions.hideCompleted = document.getElementById('hide-completed-checkbox') ? document.getElementById('hide-completed-checkbox').checked : false;
        
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
            await window.fetchAndDisplaySessions(
                // memoizedLoadPlayerData, // REMOVED - sessionManager.js uses window.playerData directly
                window.addPlayer, 
                window.createUsernameHistoryModal, 
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

    fetchButton.addEventListener('click', async () => {
        if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Fetching sessions...</p>';
        }
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (sessionListDiv) sessionListDiv.style.display = 'none'; 

        await window.fetchAndDisplaySessions(
            // memoizedLoadPlayerData, // REMOVED - sessionManager.js uses window.playerData directly
            window.addPlayer,      
            window.createUsernameHistoryModal, 
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

    officialOnlyCheckbox.addEventListener('change', () => {
        showOfficialOnly = officialOnlyCheckbox.checked;
        if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Applying filter...</p>';
            sessionListDiv.style.display = 'block'; 
        }
        if (loadingIndicator) loadingIndicator.style.display = 'none'; 
        
        loadPlayerData(playerData => {
            if (window.renderSessions) {
                window.renderSessions(latestSessionData, playerData, sessionListDiv, { officialOnly: showOfficialOnly }, addPlayer, createUsernameHistoryModal);
            } else {
                console.error('renderSessions function not found. Cannot re-render with filter.');
                if (sessionListDiv) sessionListDiv.innerHTML = '<p class="error-message">Error applying filter.</p>';
            }
        });
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadPlayerData(playerData => {
                displayKnownPlayers(
                    knownPlayersDiv, 
                    searchTerm, 
                    playerData, 
                    latestSessionData, 
                    createUsernameHistoryModal, 
                    refreshUserManagementTab
                );
            });
        }, 300);
    });

    // Add Player Manually Button (Handles both Add and Update via window.addPlayer)
    if (addPlayerButton) {
        addPlayerButton.innerHTML = '<img src="../icons/addbutton.svg" alt="Add Player" class="button-icon" /> Add';
        addPlayerButton.title = 'Add Player Manually'; 

        addPlayerButton.addEventListener('click', async () => {
            if (typeof window.addPlayer !== 'function') {
                ModalManager.showAlert('Error', 'User management feature is unavailable. The addPlayer function is not loaded correctly.');
                console.error('window.addPlayer is not defined or not a function.');
                return;
            }

            const modalTitle = 'Add New Player';
            const modalBodyHtml = `
                <div>
                    <label for="modalPlayerId">Player ID (required):</label>
                    <input type="text" id="modalPlayerId" name="modalPlayerId">
                </div>
                <div>
                    <label for="modalPlayerName">Name:</label>
                    <input type="text" id="modalPlayerName" name="modalPlayerName">
                </div>
                <div>
                    <label for="modalPlayerScore">Score (1-5, optional):</label>
                    <input type="number" id="modalPlayerScore" name="modalPlayerScore" min="1" max="5">
                </div>
                <div>
                    <label for="modalPlayerNotes">Notes (optional):</label>
                    <textarea id="modalPlayerNotes" name="modalPlayerNotes" rows="3"></textarea>
                </div>
            `;

            ModalManager.showModal(modalTitle, modalBodyHtml, [
                {
                    text: 'Cancel',
                    className: 'modal-button-secondary'
                },
                {
                    text: 'Add Player',
                    className: 'modal-button-primary',
                    callback: async () => {
                        const playerId = document.getElementById('modalPlayerId').value.trim();
                        const name = document.getElementById('modalPlayerName').value.trim();
                        const scoreStr = document.getElementById('modalPlayerScore').value.trim();
                        const notes = document.getElementById('modalPlayerNotes').value.trim();

                        if (!playerId) {
                            ModalManager.showAlert('Error', 'Player ID cannot be empty.');
                            return; 
                        }

                        const playerName = name || `Player ${playerId}`;
                        let score = null;
                        if (scoreStr) {
                            const parsedScore = parseInt(scoreStr, 10);
                            if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
                                ModalManager.showAlert('Invalid Input', 'Invalid score. Must be a number between 1 and 5. Score will be ignored.');
                            } else {
                                score = parsedScore;
                            }
                        }

                        try {
                            const uiUpdateCallback = (updatedPlayer) => {
                                ModalManager.showAlert('Success', `Player ${updatedPlayer.name} (ID: ${updatedPlayer.id}) ${score !== null ? 'with score ' + score : ''} has been added/updated successfully.`);
                                if (typeof refreshUserManagementTab === 'function') {
                                    refreshUserManagementTab(); 
                                } else {
                                    console.warn('refreshUserManagementTab function not found, UI may not update.');
                                }
                                ModalManager.closeModal(); 
                            };
                            await window.addPlayer(playerId, playerName, score, notes, false, uiUpdateCallback);
                        } catch (error) {
                            console.error('Failed to add/update player:', error);
                            ModalManager.showAlert('Error', `Failed to add/update player: ${error.message}`);
                        }
                    },
                    closesModal: false 
                }
            ]);
        });
    } else {
        console.warn('Add Player Manually button not found.');
    }

    // Export player data
    if (exportPlayersButton) {
        exportPlayersButton.innerHTML = '<span class="button-icon">📤</span> Export'; 
        exportPlayersButton.title = 'Export Players (CSV)'; 

        exportPlayersButton.addEventListener('click', () => {
            if (typeof window.loadPlayerData === 'function' && typeof window.exportPlayerDataCSV === 'function') {
                window.loadPlayerData(playerData => {
                    if (Object.keys(playerData).length === 0) {
                        ModalManager.showAlert('Export Notice', "No player data to export.");
                        return;
                    }
                    window.exportPlayerDataCSV(playerData);
                });
            } else {
                ModalManager.showAlert('Error', 'Export feature is unavailable.');
                console.error('loadPlayerData or exportPlayerDataCSV not found on window.');
            }
        });
    } else {
        console.warn('Export Players button not found.');
    }

    // Import player data
    if (importPlayersButton && importFileInput && importStatusDiv) {
        importPlayersButton.innerHTML = '<span class="button-icon">📥</span> Import'; 
        importPlayersButton.title = 'Import Players (CSV)'; 

        importPlayersButton.addEventListener('click', () => importFileInput.click());

        importFileInput.addEventListener('change', (event) => {
            const statusCallback = (message, isError) => {
                importStatusDiv.textContent = message;
                importStatusDiv.className = `import-status-message ${isError ? 'error' : 'success'}`;
                importStatusDiv.style.display = 'block';
            };

            const file = event.target.files[0];
            if (file) {
                const successCallback = (parsedData) => {
                    window.replaceAllPlayerDataAndSave(parsedData, () => { 
                        statusCallback('Player data imported successfully! Reloading list...', false);
                        refreshUserManagementTab(); 
                        event.target.value = null; 
                    });
                };
                window.importPlayerDataCSV(file, successCallback, statusCallback); 
            } else {
                statusCallback('No file selected.', true);
            }
        });
    } else {
        console.warn('Import Players button, file input, or status div not found.');
    }

    if (clearAllPlayerDataButton) {
        clearAllPlayerDataButton.addEventListener('click', function() {
            ModalManager.showConfirm(
                'Confirm Clear Data',
                'Are you sure you want to clear ALL player data? This action cannot be undone and is primarily for testing.',
                () => { 
                    chrome.storage.local.set({ playerData: {} }, function() {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing player data:', chrome.runtime.lastError);
                            ModalManager.showAlert('Error', 'Error clearing player data. Please try again.');
                        } else {
                            console.log('All player data cleared.');
                            ModalManager.showAlert('Success', 'All player data has been cleared.');
                            
                            if (typeof window.allPlayerData !== 'undefined') {
                                 window.allPlayerData = {}; 
                            } else if (typeof allPlayerData !== 'undefined') { 
                                allPlayerData = {};
                            }

                            if (typeof refreshUserManagementTab === 'function') {
                                refreshUserManagementTab();
                            } else if (typeof userManager !== 'undefined' && typeof userManager.renderKnownPlayers === 'function') {
                                userManager.renderKnownPlayers(); 
                            } else {
                                console.warn('Could not refresh user management tab after clearing data.');
                            }
                        }
                    });
                },
                () => { 
                    ModalManager.showAlert('Cancelled', 'Clear data operation was cancelled.');
                }
            );
        });
    } else {
        console.warn('Clear All Player Data button not found.');
    }

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