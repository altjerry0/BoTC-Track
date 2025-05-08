// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js

document.addEventListener('DOMContentLoaded', function() {
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

    // Dark Mode Toggle (moved from modal)
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Tab References
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Content Area References
    const sessionResultsDiv = document.getElementById('sessionResults'); // This is now just a container for loadingIndicator and sessionList
    const sessionListDiv = document.getElementById('sessionList'); // Specific div for session cards
    const loadingIndicator = document.getElementById('loadingIndicator');
    const knownPlayersDiv = document.getElementById('knownPlayers');

    // State
    let latestSessionData = null; // Variable to store the latest session data
    let lastFetchedSessions = []; // Store the last fetched sessions
    let showOfficialOnly = false; // Store the filter state
    let searchTimeout = null;

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
                    if (session && session.players && Array.isArray(session.players)) {
                        session.players.forEach(player => {
                            if (player && player.id) {
                                onlineIds.add(player.id.toString()); // Ensure ID is string
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
     * @param {Map<string, string>} onlinePlayersMap - Map of online player IDs to their session names.
     */
    function updateOnlineFavoritesList(playerData, onlinePlayersMap) {
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
            if (playerData[playerId].isFavorite && onlinePlayersMap.has(playerId)) {
                onlineFavorites.push({
                    ...playerData[playerId],
                    id: playerId, // Ensure player ID is part of the object
                    sessionName: onlinePlayersMap.get(playerId) // Corrected to sessionName for clarity from onlinePlayersMap
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
                lastFetchedSessions = sessions; 
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
                window.renderSessions(lastFetchedSessions, playerData, sessionListDiv, { officialOnly: showOfficialOnly }, addPlayer, createUsernameHistoryModal);
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
        addPlayerButton.addEventListener('click', () => {
            const playerId = prompt("Enter Player ID (required):");
            if (!playerId || playerId.trim() === '') {
                alert("Player ID cannot be empty.");
                return; // Stop if no ID
            }
            const id = playerId.trim();

            const name = prompt(`Enter name for player ${id}:`, `Player ${id}`);
            if (name === null) return; // Stop if cancelled

            const scoreStr = prompt(`Enter score (1-5) for ${name || `Player ${id}`}:`, '3');
            if (scoreStr === null) return; // Stop if cancelled

            let score = parseInt(scoreStr, 10);
            if (isNaN(score) || score < 1 || score > 5) {
                alert("Invalid score. Must be 1-5. Setting to 3.");
                score = 3;
            }

            const notes = prompt(`Enter notes for ${name || `Player ${id}`}:`, '');
            if (notes === null) return; // Stop if cancelled

            // Call the universal addPlayer function
            if (typeof window.addPlayer === 'function') {
                // Assume new players are not favorites by default
                window.addPlayer(id, name, score, notes, false, (success, message) => {
                    if (success) {
                        refreshUserManagementTab(); // Refresh the list
                    } else {
                        alert(`Failed to add/update player: ${message}`);
                        console.error(`Failed to add/update player ${id}: ${message}`);
                    }
                });
            } else {
                console.error('window.addPlayer function not found!');
                alert('Add/Update feature is unavailable.');
            }
        });
    } else {
        console.warn('Add Player Manually button not found.');
    }

    // Export Players Button
    if (exportPlayersButton) {
        exportPlayersButton.addEventListener('click', () => {
            if (typeof window.exportPlayerDataCSV === 'function') {
                window.exportPlayerDataCSV();
            } else {
                console.error('window.exportPlayerDataCSV function not found.');
                alert('Export function is unavailable. Check console.');
            }
        });
    } else {
        console.warn('Export Players button not found.');
    }

    // Import Players Button (triggers hidden file input)
    if (importPlayersButton && importFileInput) {
        importPlayersButton.addEventListener('click', () => {
            importFileInput.click(); // Open file dialog
        });
    } else {
        console.warn('Import Players button or file input not found.');
    }

    // File Input Change Listener (for import)
    if (importFileInput && importStatusDiv) {
        importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return; // No file selected
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const csvContent = e.target.result;
                if (typeof window.importPlayerDataCSV === 'function') {
                    importStatusDiv.textContent = 'Importing...';
                    importStatusDiv.style.color = '#aaa'; // Reset color
                    importStatusDiv.style.display = 'inline'; // Show status
                    
                    window.importPlayerDataCSV(csvContent, (success, message) => {
                        // Update status message based on import result
                        importStatusDiv.textContent = message;
                        importStatusDiv.style.color = success ? 'lightgreen' : 'salmon';
                        // Optionally hide message after a delay
                        // setTimeout(() => { importStatusDiv.style.display = 'none'; }, 5000);
                    }, refreshUserManagementTab); // Pass refresh function
                } else {
                    console.error('window.importPlayerDataCSV function not found.');
                    alert('Import function is unavailable. Check console.');
                     importStatusDiv.textContent = 'Import unavailable.';
                     importStatusDiv.style.color = 'salmon';
                     importStatusDiv.style.display = 'inline';
                }
                 // Clear the input value to allow importing the same file again
                 event.target.value = null;
            };

            reader.onerror = (e) => {
                console.error('Error reading file:', e);
                alert('Error reading file. See console for details.');
                importStatusDiv.textContent = 'File read error.';
                importStatusDiv.style.color = 'salmon';
                importStatusDiv.style.display = 'inline';
                event.target.value = null; // Clear input value
            };

            reader.readAsText(file);
        });
    } else {
        console.warn('Import file input or status div not found.');
    }

    if (clearAllPlayerDataButton) {
        clearAllPlayerDataButton.addEventListener('click', function() {
            if (confirm("Are you sure you want to clear ALL player data? This action cannot be undone and is primarily for testing.")) {
                // Save an empty object to the 'playerData' key
                chrome.storage.local.set({ playerData: {} }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Error clearing player data:', chrome.runtime.lastError);
                        alert('Error clearing player data. Please try again.');
                    } else {
                        console.log('All player data cleared.');
                        alert('All player data has been cleared.');
                        
                        // Update the local cache in userManager.js as well if it's used directly
                        // This assumes allPlayerData from userManager might be exposed or accessible
                        if (typeof window.allPlayerData !== 'undefined') {
                             window.allPlayerData = {}; 
                        } else if (typeof allPlayerData !== 'undefined') { // if popup.js has its own copy
                            allPlayerData = {};
                        }

                        // Refresh the display in the User Management tab
                        if (typeof refreshUserManagementTab === 'function') {
                            refreshUserManagementTab();
                        } else if (typeof displayKnownPlayers === 'function' && typeof window.createUsernameHistoryModal === 'function') {
                            const knownPlayersDiv = document.getElementById('knownPlayers');
                            if (knownPlayersDiv) {
                                // Attempt to call displayKnownPlayers with necessary parameters
                                // Note: refreshUserManagementTab itself might be the intended callback here
                                displayKnownPlayers(knownPlayersDiv, '', {}, null, window.createUsernameHistoryModal, refreshUserManagementTab || displayKnownPlayers); 
                            }
                        } else {
                            const knownPlayersDiv = document.getElementById('knownPlayers');
                            if(knownPlayersDiv) knownPlayersDiv.innerHTML = '<p>No players found. Please switch tabs or reload to refresh.</p>';
                        }
                    }
                });
            }
        });
    }

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
        lastFetchedSessions = sessions; // Store initially fetched sessions
        // Load initial players for the hidden management tab
        loadPlayerData(playerData => {
            displayKnownPlayers(knownPlayersDiv, '', playerData, latestSessionData, createUsernameHistoryModal);
        });
    });

    // Show the default tab (sessions)
    showTab('sessions'); 

    // Load initial player data for known users tab (if it's the default or becomes active)
    // This might be redundant if showTab handles it, but good for initial explicit load.
    if (document.getElementById('userManagement').classList.contains('active')) {
        refreshUserManagementTab();
    }

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