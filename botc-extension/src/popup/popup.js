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

    // Tab References
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Content Area References
    const sessionResultsDiv = document.getElementById('sessionResults');
    const knownPlayersDiv = document.getElementById('knownPlayers');

    // State
    let latestSessionData = null; // Variable to store the latest session data
    let lastFetchedSessions = []; // Store the last fetched sessions
    let showOfficialOnly = false; // Store the filter state
    let searchTimeout = null;

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
        console.log("[Debug Flow] Fetching online player IDs...");
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
                console.log(`[Debug Flow] Found ${onlineIds.size} unique online player IDs.`);
            } else {
                console.warn("[Debug Flow] No sessions found or invalid format when fetching online IDs.", response);
            }
            callback(onlineIds);
        });
    }

    /**
     * Refreshes the content of the User Management tab.
     */
    function refreshUserManagementTab() {
        console.log("[Refresh UI] Refreshing User Management Tab");
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
        sessionResultsDiv.innerHTML = '<p>Fetching sessions...</p>'; // Show loading message
        // Pass the current filter state and required functions to the fetch function
        fetchAndDisplaySessions(
            loadPlayerData, // Pass function
            addPlayer,      // Pass function
            createUsernameHistoryModal, // Pass function
            sessionResultsDiv,
            { officialOnly: showOfficialOnly }, 
            (sessions) => {
            latestSessionData = sessions; // Store updated session data
            lastFetchedSessions = sessions; // Store fetched sessions
        });
    });

    officialOnlyCheckbox.addEventListener('change', () => {
        showOfficialOnly = officialOnlyCheckbox.checked;
        // Re-render the stored sessions with the new filter state
        loadPlayerData(playerData => {
            renderSessions(lastFetchedSessions, playerData, sessionResultsDiv, { officialOnly: showOfficialOnly }, addPlayer, createUsernameHistoryModal); // Pass addPlayer/createHistory again if needed by render logic
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
    const addPlayerButton = document.getElementById('add-player-button');
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
                        console.log(`Player ${id} added/updated via manual button.`);
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

    // Initial fetch on load, respecting checkbox state (which is initially false)
    fetchAndDisplaySessions(
        loadPlayerData, // Pass function
        addPlayer,      // Pass function
        createUsernameHistoryModal, // Pass function
        sessionResultsDiv,
        { officialOnly: showOfficialOnly }, 
        (sessions) => {
        latestSessionData = sessions; // Store initially fetched sessions
        lastFetchedSessions = sessions; // Store initially fetched sessions
        // Load initial players for the hidden management tab
        loadPlayerData(playerData => {
            displayKnownPlayers(knownPlayersDiv, '', playerData, latestSessionData, createUsernameHistoryModal);
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