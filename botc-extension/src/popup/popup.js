// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js

document.addEventListener('DOMContentLoaded', async function() {
    // Button and Controls References
    const fetchButton = document.getElementById('fetchButton');
    const officialOnlyCheckbox = document.getElementById('officialOnlyCheckbox');
    const searchInput = document.getElementById('userSearch'); // Corrected ID from HTML
    const exportPlayersButton = document.getElementById('export-players-button');
    const importPlayersButton = document.getElementById('import-players-button');
    const importFileInput = document.getElementById('import-file-input');
    const importStatusDiv = document.getElementById('import-status');
    const addPlayerButton = document.getElementById('add-player-button'); // Added for completeness
    const clearAllPlayerDataButton = document.getElementById('clear-all-player-data-button'); // New button
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
    let latestSessionData = null; // Variable to store the latest session data
    let showOfficialOnly = false; // Store the filter state
    let searchTimeout = null;
    let currentUserID = null; // Variable to store the logged-in user's ID

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
            return decodedToken.id || null; // Ensure 'id' claim exists
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

    // Load theme preference
    chrome.storage.local.get(['theme'], function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error loading theme preference:', chrome.runtime.lastError);
            setDarkMode(false); // Default to light mode on error
            if (darkModeToggle) darkModeToggle.checked = false;
            return;
        }
        if (result.theme === 'dark') {
            setDarkMode(true);
            if (darkModeToggle) darkModeToggle.checked = true;
        } else {
            setDarkMode(false); // Default to light mode or if no preference found
            if (darkModeToggle) darkModeToggle.checked = false;
        }
    });

    // Dark Mode Toggle Logic (no longer needs to be conditional on settings modal elements)
    if (darkModeToggle && typeof darkModeToggle.addEventListener === 'function') {
        darkModeToggle.addEventListener('change', function() {
            setDarkMode(this.checked);
        });
    } else {
        console.error('darkModeToggle is NOT valid or addEventListener is missing after UI change. This should not happen.');
        // Fallback or further error logging if needed, but the element should exist directly in the header now.
    }

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
                    searchInput.value.trim(), // Use trimmed search value
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
                                onlineIds.add(user.id.toString()); // Ensure ID is string
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
        console.log('[Popup] onlinePlayersMap received (should be object):', onlinePlayersMap, 'Is Map?', onlinePlayersMap instanceof Map); // Log will show false
        const favoritesListDiv = document.getElementById('onlineFavoritesList');
        const favoritesCountSpan = document.getElementById('onlineFavoritesCount');

        if (!favoritesListDiv || !favoritesCountSpan) {
            console.warn('onlineFavoritesList DIV or onlineFavoritesCount SPAN not found in popup.html.');
            return;
        }

        favoritesListDiv.innerHTML = ''; // Clear previous list
        favoritesCountSpan.textContent = '0'; // Reset count

        if (!playerData || Object.keys(playerData).length === 0) {
            favoritesListDiv.textContent = 'No player data available.';
            return;
        }

        const onlineFavorites = [];
        for (const playerId in playerData) {
            // Use hasOwnProperty for plain objects instead of .has() for Maps
            if (playerData[playerId].isFavorite && onlinePlayersMap.hasOwnProperty(playerId)) { 
                onlineFavorites.push({
                    ...playerData[playerId],
                    id: playerId, // Ensure player ID is part of the object
                    // Use direct property access for plain objects instead of .get() for Maps
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
        ul.classList.add('player-list'); // Add a class for potential styling
        onlineFavorites.forEach(player => {
            const li = document.createElement('li');
            li.classList.add('player-item'); // Add a class for potential styling
            li.innerHTML = `
                <span class="player-name">${player.name}</span> 
                <span class="player-rating">(Rating: ${player.score || 'N/A'})</span> - 
                <span class="player-session">Online in: ${player.sessionName}</span>
            `;
            // Add more details or styling as needed, e.g., link to session or player notes
            ul.appendChild(li);
        });
        favoritesListDiv.appendChild(ul);
    }

    // Expose the function to be callable from sessionManager.js
    window.updateOnlineFavoritesListFunc = updateOnlineFavoritesList;

    /**
     * Refreshes the content of the User Management tab.
     */
    function refreshUserManagementTab() {
        if (!knownPlayersDiv) {
            console.error('User list container not found for refresh.');
            return;
        }
        // Immediately clear the current list to show activity
        knownPlayersDiv.innerHTML = '<p class="loading-message">Loading player data...</p>'; 

        if (typeof window.loadPlayerData === 'function' && typeof window.displayKnownPlayers === 'function') {
            // Need online players to pass to displayKnownPlayers for sorting
            fetchOnlinePlayerIds(onlinePlayerIds => {
                window.loadPlayerData((playerData) => {
                    window.displayKnownPlayers(
                        knownPlayersDiv,
                        searchInput.value.trim(), // Pass current search term
                        playerData,
                        latestSessionData, 
                        createUsernameHistoryModal, // Pass the modal creation function
                        refreshUserManagementTab // Pass self for recursive refresh after actions
                    );
                });
            });
       
        } else {
            console.error('Required functions (loadPlayerData or displayKnownPlayers) not found on window.');
            knownPlayersDiv.innerHTML = '<p class="error-message">Error loading player management functions.</p>';
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

    fetchButton.addEventListener('click', () => {
        if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Fetching sessions...</p>';
        }
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (sessionListDiv) sessionListDiv.style.display = 'none'; // Hide list while loading

        fetchAndDisplaySessions(
            loadPlayerData, 
            addPlayer,      
            createUsernameHistoryModal, 
            updateOnlineFavoritesList, 
            sessionListDiv, // Pass sessionListDiv as the target for session cards
            { officialOnly: showOfficialOnly }, 
            (sessions, finalPlayerData) => { // Modified callback to receive final data
                latestSessionData = sessions; 
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (sessionListDiv) sessionListDiv.style.display = 'block'; // Show list again
                // updateOnlineFavoritesList is already called within checkHistoryAndRender
            }
        );
    });

    officialOnlyCheckbox.addEventListener('change', () => {
        showOfficialOnly = officialOnlyCheckbox.checked;
        if (sessionListDiv) {
            sessionListDiv.innerHTML = '<p class="loading-message">Applying filter...</p>';
            sessionListDiv.style.display = 'block'; // Ensure it's visible if previously hidden
        }
        if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide if it was somehow visible
        
        loadPlayerData(playerData => {
            // Directly call renderSessions from sessionManager.js (assuming it's globally available or imported)
            // This assumes renderSessions is exposed on the window object or properly imported if using modules.
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
        // Debounce
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            // Re-display players matching the search term, passing session data
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
        // Update button to use SVG icon + text. No longer a player-action-button.
        addPlayerButton.innerHTML = '<img src="../icons/addbutton.svg" alt="Add Player" class="button-icon" /> Add';
        // addPlayerButton.classList.add('player-action-button'); // Removed
        addPlayerButton.title = 'Add Player Manually'; // Tooltip remains useful

        addPlayerButton.addEventListener('click', async () => {
            // Check if the globally exposed addPlayer function from userManager.js is available
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
                            // Re-show prompt or indicate error on field directly in future enhancement
                            return; 
                        }

                        const playerName = name || `Player ${playerId}`;
                        let score = null;
                        if (scoreStr) {
                            const parsedScore = parseInt(scoreStr, 10);
                            if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
                                ModalManager.showAlert('Invalid Input', 'Invalid score. Must be a number between 1 and 5. Score will be ignored.');
                                // Don't set score if invalid, or re-prompt / highlight field
                            } else {
                                score = parsedScore;
                            }
                        }

                        try {
                            // Define the UI update callback for after player data is saved
                            const uiUpdateCallback = (updatedPlayer) => {
                                ModalManager.showAlert('Success', `Player ${updatedPlayer.name} (ID: ${updatedPlayer.id}) ${score !== null ? 'with score ' + score : ''} has been added/updated successfully.`);
                                if (typeof refreshUserManagementTab === 'function') {
                                    refreshUserManagementTab(); // Refresh the list using the function defined in popup.js
                                } else {
                                    console.warn('refreshUserManagementTab function not found, UI may not update.');
                                }
                                ModalManager.closeModal(); // Close the add player modal
                            };
                            // Call the globally exposed addPlayer from userManager.js
                            // Parameters: id, name, score, notes, isFavorite (default false), updateUICallback
                            await window.addPlayer(playerId, playerName, score, notes, false, uiUpdateCallback);
                        } catch (error) {
                            console.error('Failed to add/update player:', error);
                            ModalManager.showAlert('Error', `Failed to add/update player: ${error.message}`);
                        }
                    },
                    closesModal: false // We handle close explicitly after success or if user needs to correct input
                }
            ]);
        });
    } else {
        console.warn('Add Player Manually button not found.');
    }

    // Export player data
    if (exportPlayersButton) {
        exportPlayersButton.innerHTML = '<span class="button-icon">📤</span> Export'; // Icon + Text. No longer player-action-button.
        // exportPlayersButton.classList.add('player-action-button'); // Removed
        exportPlayersButton.title = 'Export Players (CSV)'; // Tooltip remains useful

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
        importPlayersButton.innerHTML = '<span class="button-icon">📥</span> Import'; // Icon + Text. No longer player-action-button.
        // importPlayersButton.classList.add('player-action-button'); // Removed
        importPlayersButton.title = 'Import Players (CSV)'; // Tooltip remains useful

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
                    window.replaceAllPlayerDataAndSave(parsedData, () => { // Calls userManager.replaceAllPlayerDataAndSave
                        statusCallback('Player data imported successfully! Reloading list...', false);
                        refreshUserManagementTab(); // Refresh the user management tab from popup.js
                        event.target.value = null; // Clear the file input
                    });
                };
                window.importPlayerDataCSV(file, successCallback, statusCallback); // Calls csvManager.importPlayerDataCSV
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
                () => { // onConfirm callback
                    chrome.storage.local.set({ playerData: {} }, function() {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing player data:', chrome.runtime.lastError);
                            ModalManager.showAlert('Error', 'Error clearing player data. Please try again.');
                        } else {
                            console.log('All player data cleared.');
                            ModalManager.showAlert('Success', 'All player data has been cleared.');
                            
                            // Update the local cache in userManager.js as well if it's used directly
                            if (typeof window.allPlayerData !== 'undefined') {
                                 window.allPlayerData = {}; 
                            } else if (typeof allPlayerData !== 'undefined') { // if popup.js has its own copy
                                allPlayerData = {};
                            }

                            // Refresh the display in the User Management tab
                            if (typeof refreshUserManagementTab === 'function') {
                                refreshUserManagementTab();
                            } else if (typeof userManager !== 'undefined' && typeof userManager.renderKnownPlayers === 'function') {
                                userManager.renderKnownPlayers(); // Prefer this if available
                            } else {
                                console.warn('Could not refresh user management tab after clearing data.');
                            }
                        }
                    });
                },
                () => { // onCancel callback
                    ModalManager.showAlert('Cancelled', 'Clear data operation was cancelled.');
                }
            );
        });
    } else {
        console.warn('Clear All Player Data button not found.');
    }

    // Get and store current user ID from authToken
    chrome.storage.local.get(['authToken'], (result) => {
        if (result.authToken) {
            currentUserID = parseJwt(result.authToken);
            window.currentUserID = currentUserID; // Expose to global scope
            if (currentUserID) {
                console.log('Current User ID:', currentUserID);
                // If session data is already loaded, re-render to apply highlighting
                // This is important if session data loads before authToken is processed
                if (latestSessionData && latestSessionData.length > 0) {
                    window.sessionManager.displaySessions(latestSessionData); 
                }
            } else {
                console.warn('Could not extract user ID from authToken.');
            }
        } else {
            console.warn('AuthToken not found in storage.');
        }
    });

    // Initial setup
    // Initial fetch on load, respecting checkbox state (which is initially false)
    fetchAndDisplaySessions(
        loadPlayerData, // Pass function
        addPlayer,      // Pass function
        createUsernameHistoryModal, // Pass function
        updateOnlineFavoritesList, // Pass the new function
        sessionListDiv, // Pass sessionListDiv as the target for session cards
        { officialOnly: showOfficialOnly }, 
        (sessions, finalPlayerData) => {
        latestSessionData = sessions; // Store initially fetched sessions
        // Load initial players for the hidden management tab
        loadPlayerData(playerData => {
            displayKnownPlayers(knownPlayersDiv, '', playerData, latestSessionData, createUsernameHistoryModal, refreshUserManagementTab);
        });
    });

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
});