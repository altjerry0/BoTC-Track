// This is the main script for the popup interface.
// It orchestrates calls to functions defined in userManager.js and sessionManager.js

// Globally accessible filter options for the popup
let currentFilterOptions = { officialOnly: false, hideCompleted: false };

import { initializeEditPlayerModal, initializeAddPlayerModal } from '../utils/modal.js'; // Corrected path and combined import
import { fetchAndDisplaySessions, createSessionCard, formatTimeAgo } from './sessionManager.js';
import {
    initializeUserManagement,
    addPlayer,
    displayKnownPlayers,
    searchPlayersAndUpdateDisplay,
    getRatingClass,
    renderKnownPlayers,
    replaceAllPlayerDataAndSave, // <-- Import added here
    setupUserManagementListeners,
} from './userManager.js';
import { ModalManager } from '../utils/modal.js'; // Use named import
import { exportPlayerDataCSV, importPlayerDataCSV } from './csvManager.js';

// Firebase imports (only what's needed for popup-triggered sign-in)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth'; // Use signInWithCredential

// Use the same Firebase config as background.js (Consider centralizing this?)
const firebaseConfig = {
    apiKey: "AIzaSyDVk_kuvYQ_JH700jKXrdSpOtcd3DFC9Rs",
    authDomain: "botctracker.firebaseapp.com",
    projectId: "botctracker",
    storageBucket: "botctracker.firebasestorage.app",
    messagingSenderId: "234038964353",
    appId: "1:234038964353:web:94c42aa23b68e003fd9d80",
    measurementId: "G-C4FLY32JKZ"
};
  

// Initialize Firebase App (needed for getAuth)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get auth instance for the popup context

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
    const manualSyncButton = document.getElementById('manual-sync-button'); // Get the new button
    const manualSyncStatus = document.getElementById('manual-sync-status'); // Get the status span

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

    // Function to update the online favorites list
    function updateOnlineFavoritesList(playerData, onlinePlayerIds) {
        const listDiv = document.getElementById('onlineFavoritesList');
        const countSpan = document.getElementById('onlineFavoritesCount');
        if (!listDiv || !countSpan) {
            console.error('[Popup] Online favorites list or count element not found.');
            return;
        }
        if (!playerData || !(onlinePlayerIds instanceof Set)) {
            console.error('[Popup] Invalid data received by updateOnlineFavoritesList.');
            listDiv.innerHTML = '<i>Error loading favorites.</i>';
            countSpan.textContent = '0';
            return;
        }

        console.log(`[Popup] Updating online favorites. Total known: ${Object.keys(playerData).length}, Online IDs: ${onlinePlayerIds.size}`);

        listDiv.innerHTML = ''; // Clear previous list
        let onlineFavoritesCount = 0;
        const fragment = document.createDocumentFragment(); // Use fragment for efficiency

        // Sort onlinePlayerIds alphabetically by name for consistent display
        const sortedOnlineIds = Array.from(onlinePlayerIds).sort((idA, idB) => {
            const nameA = playerData[idA]?.name || '';
            const nameB = playerData[idB]?.name || '';
            return nameA.localeCompare(nameB);
        });

        sortedOnlineIds.forEach(playerId => {
            const player = playerData[playerId];
            if (player && player.isFavorite) {
                onlineFavoritesCount++;
                const playerSpan = document.createElement('span');
                playerSpan.className = 'online-favorite-player'; // Add class for potential styling
                playerSpan.textContent = player.name;
                // Maybe add a click handler later to jump to the player in user management?
                fragment.appendChild(playerSpan);
                // Add a separator (like a comma) if desired, except for the last one
                // This simple version just adds spans next to each other
            }
        });

        if (onlineFavoritesCount > 0) {
            listDiv.appendChild(fragment);
        } else {
            listDiv.innerHTML = '<i>No favorites currently online.</i>';
        }

        countSpan.textContent = onlineFavoritesCount.toString();
    }

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
            // Call the async render function from userManager.js
            // This function now handles loading data itself.
            // No need to await if we don't need the result immediately.
            renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
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
     * @param {Set<string>} onlinePlayerIds - Set of online player IDs.
     */
    function updateOnlineFavoritesList(playerData, onlinePlayerIds) {
        // console.log('[Popup] onlinePlayerIds received (should be object):', onlinePlayerIds, 'Is Map?', onlinePlayerIds instanceof Map); 
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
            if (playerData[playerId].isFavorite && onlinePlayerIds.has(playerId)) { 
                onlineFavorites.push({
                    ...playerData[playerId],
                    id: playerId, 
                    sessionName: 'Unknown' // Session name is unknown in this implementation
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
        renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
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
            await fetchAndDisplaySessions(
                addOrUpdatePlayer, 
                createUsernameHistoryModal, 
                updateOnlineFavoritesListFunc,
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
            switchTab(tabId);
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
                    renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
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

        await fetchAndDisplaySessions(
            addOrUpdatePlayer,      
            createUsernameHistoryModal, 
            updateOnlineFavoritesListFunc,
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
        if (!fetchAndDisplaySessions) {
            console.error('fetchAndDisplaySessions function not found. Cannot re-render with filters.');
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

        // Call fetchAndDisplaySessions with existing data and updated filters
        fetchAndDisplaySessions(
            addOrUpdatePlayer, 
            createUsernameHistoryModal, 
            updateOnlineFavoritesListFunc,
            sessionListDiv, 
            currentFilterOptions, // Pass the updated filter object
            (sessions, error) => { 
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
            if (typeof addOrUpdatePlayer !== 'function') {
                ModalManager.showAlert('Error', 'User management feature is unavailable. The addPlayer function is not loaded correctly.');
                console.error('addOrUpdatePlayer is not defined or not a function.');
                return;
            }

            const modalTitle = 'Add New Player Manually';

            // Create modal body using DOM manipulation
            const modalBodyContent = document.createElement('div');
            modalBodyContent.classList.add('modal-add-player-form');

            // Player ID Input
            const idDiv = document.createElement('div');
            const idLabel = document.createElement('label');
            idLabel.htmlFor = 'modalPlayerId';
            idLabel.textContent = 'Player ID:';
            const idInput = document.createElement('input');
            idInput.type = 'text';
            idInput.id = 'modalPlayerId';
            idInput.name = 'modalPlayerId'; // Keep name for potential form handling
            idInput.required = true;
            idDiv.appendChild(idLabel);
            idDiv.appendChild(idInput);
            modalBodyContent.appendChild(idDiv);

            // Player Name Input
            const nameDiv = document.createElement('div');
            const nameLabel = document.createElement('label');
            nameLabel.htmlFor = 'modalPlayerName';
            nameLabel.textContent = 'Name:';
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = 'modalPlayerName';
            nameInput.name = 'modalPlayerName';
            nameDiv.appendChild(nameLabel);
            nameDiv.appendChild(nameInput);
            modalBodyContent.appendChild(nameDiv);

            // Score Input
            const scoreDiv = document.createElement('div');
            const scoreLabel = document.createElement('label');
            scoreLabel.htmlFor = 'modalPlayerScore';
            scoreLabel.textContent = 'Score (1-5, optional):';
            const scoreInput = document.createElement('input');
            scoreInput.type = 'number';
            scoreInput.id = 'modalPlayerScore';
            scoreInput.name = 'modalPlayerScore';
            scoreInput.min = '1';
            scoreInput.max = '5';
            scoreDiv.appendChild(scoreLabel);
            scoreDiv.appendChild(scoreInput);
            modalBodyContent.appendChild(scoreDiv);

            // Notes Input
            const notesDiv = document.createElement('div');
            const notesLabel = document.createElement('label');
            notesLabel.htmlFor = 'modalPlayerNotes';
            notesLabel.textContent = 'Notes (optional):';
            const notesTextarea = document.createElement('textarea');
            notesTextarea.id = 'modalPlayerNotes';
            notesTextarea.name = 'modalPlayerNotes';
            notesTextarea.rows = 3;
            notesDiv.appendChild(notesLabel);
            notesDiv.appendChild(notesTextarea);
            modalBodyContent.appendChild(notesDiv);

            // Show modal with the created DOM node
            ModalManager.showModal(modalTitle, modalBodyContent, [
                {
                    text: 'Cancel',
                    className: 'modal-button-secondary',
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
                            await addOrUpdatePlayer(playerId, playerName, score, notes, false, uiUpdateCallback);
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

    // --- Export/Import Buttons ---
    if (exportPlayersButton) {
        exportPlayersButton.addEventListener('click', () => {
            console.log('[Popup Export] Export button clicked.');
            let flatPlayerData = {}; // Default to empty object

            // Attempt to get the flat player data, handling potential nesting
            if (window.playerData && typeof window.playerData === 'object') {
                if (window.playerData.hasOwnProperty('playerData') && window.playerData.hasOwnProperty('lastUpdated')) {
                    console.log('[Popup Export] Detected nested structure, exporting inner playerData.');
                    flatPlayerData = window.playerData.playerData || {};
                } else {
                    console.log('[Popup Export] Assuming flat structure for export.');
                    flatPlayerData = window.playerData; // Assume it's already the flat map
                }
            }

            if (typeof exportPlayerDataCSV === 'function') {
                if (flatPlayerData && Object.keys(flatPlayerData).length > 0) {
                    console.log(`[Popup Export] Calling exportPlayerDataCSV with ${Object.keys(flatPlayerData).length} players.`);
                    exportPlayerDataCSV(flatPlayerData);
                } else {
                    console.warn('[Popup Export] No player data available to export.');
                    ModalManager.showAlert('Export Failed', 'No player data loaded to export.');
                }
            } else {
                console.error('Export function (exportPlayerDataCSV) not found.');
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
                        await replaceAllPlayerDataAndSave(parsedData); 
                        
                        // Code that was previously in the inner callback now runs after await
                        importStatusDiv.textContent = 'Player data imported successfully! Reloading list...';
                        refreshUserManagementTab(); 
                        event.target.value = null; // Clear file input
                    } catch (error) {
                        console.error('Error processing imported data:', error);
                        importStatusDiv.textContent = 'Error saving imported data. Check console.';
                        importStatusDiv.className = 'import-status-message error';
                        importStatusDiv.style.display = 'block';
                    }
                };
                importPlayerDataCSV(file, successCallback, (message, isError) => {
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
        clearAllPlayerDataButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to permanently delete ALL locally stored player data? This cannot be undone locally.')) {
                console.log('[Popup Clear] User confirmed clearing all player data.');
                try {
                    await chrome.storage.local.remove('botcPlayerData');
                    console.log('[Popup Clear] Successfully removed botcPlayerData from local storage.');
                    // Clear the in-memory cache
                    window.playerData = {};
                    // Refresh the UI
                    refreshUserManagementTab();
                    ModalManager.showAlert('Success', 'All local player data has been cleared.');
                    
                    // TODO: Send message to background script to also clear data from Firebase if the user is logged in.
                    // This prevents data from just reappearing on the next sync.
                    // Example: chrome.runtime.sendMessage({ action: 'CLEAR_FIREBASE_DATA' });
                    
                } catch (error) {
                    console.error('[Popup Clear] Error clearing player data:', error);
                    ModalManager.showAlert('Error', 'Failed to clear local player data.');
                }
            }
        });
    } else {
        console.warn('[Popup Init] Clear All Data button not found.');
    }

    // --- Manual Sync Button Listener --- START
    if (manualSyncButton) {
        manualSyncButton.addEventListener('click', async () => {
            if (manualSyncButton.disabled) return; // Prevent multiple clicks

            manualSyncButton.disabled = true;
            manualSyncButton.textContent = 'Syncing...';
            manualSyncStatus.textContent = ''; // Clear previous status
            manualSyncStatus.className = ''; // Reset status class

            console.log('[Popup] Sending manualSync request to background.');

            try {
                const response = await chrome.runtime.sendMessage({ action: "manualSync" });
                console.log('[Popup] Received response from manualSync:', response);

                if (response && response.success) {
                    manualSyncStatus.textContent = response.message || 'Sync Successful!'; 
                    manualSyncStatus.className = 'sync-success'; 
                    // Refresh the data in the current active tab
                    refreshCurrentTabData();
                } else {
                    manualSyncStatus.textContent = `Sync Failed: ${response?.error || response?.message || 'Unknown error'}`;
                    manualSyncStatus.className = 'sync-error'; // Add class for styling
                } 
            } catch (error) {
                console.error('[Popup] Error sending manualSync message or processing response:', error);
                manualSyncStatus.textContent = `Sync Error: ${error.message}`;
                manualSyncStatus.className = 'sync-error';
            } finally {
                manualSyncButton.disabled = false;
                manualSyncButton.textContent = 'Sync Data Now';
                // Optionally clear the status message after a few seconds
                setTimeout(() => {
                     if (manualSyncStatus.className !== 'sync-error') {
                         manualSyncStatus.textContent = '';
                         manualSyncStatus.className = '';
                     }
                }, 5000); // Clear after 5 seconds unless it was an error
            }
        });
    } else {
        console.warn('[Popup] Manual sync button not found.');
    }
    // --- Manual Sync Button Listener --- END


    // Function to refresh data for the currently active tab
    function refreshCurrentTabData() {
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) return;

        if (activeTab.id === 'sessions' && fetchButton) {
            console.log('[Popup] Refreshing Sessions tab data after sync.');
            fetchButton.click(); // Simulate click on fetch button
        } else if (activeTab.id === 'userManagement' && window.userManager) {
            console.log('[Popup] Refreshing User Management tab data after sync.');
            // Assuming userManager has a function to refresh its view
            // We might need to enhance userManager to expose a refresh function if needed
            // For now, let's reload the known players list
            userManager.displayKnownPlayers(); 
        }
    }

    // Function to show tab content
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
            renderKnownPlayers(knownPlayersDiv, searchInput.value.trim());
        }
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

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('[Popup Listener] Received message:', message.type);
        switch (message.type) {
            case 'SESSION_DATA_UPDATED':
                console.log('[Popup Listener] Session data updated, refreshing display.');
                refreshDisplayedSessions(); // Refresh the session list if visible
                break;
            case 'AUTH_STATE_CHANGED':
                console.log('[Popup Listener] Auth state changed:', message.payload);
                updateAuthUI(message.payload); // Update login/logout buttons
                // Potentially refresh data or tabs based on auth state
                break;
            case 'PLAYER_DATA_LOADED': // Ensure background sends this after initial load/sync
                console.log('[Popup Listener] Player data loaded from background.');
                window.playerData = message.payload;
                // Refresh relevant UI elements if they are active
                const activeTabContent = document.querySelector('.tab-content.active');
                if (activeTabContent && activeTabContent.id === 'userManagement') {
                    refreshUserManagementTab();
                }
                break;
            case 'CURRENT_GAME_INFO': // Handle the message from background
                console.log('[Popup Listener] Received CURRENT_GAME_INFO:', message.payload);
                // TODO: Decide what to do with this info (e.g., display it somewhere)
                break;
            default:
                console.log('[Popup Listener] Received unhandled message type:', message.type);
                break;
        }
        // Return true if you need to send an asynchronous response (usually not needed for listeners)
        // return true;
    });

    // Settings Tab Elements
    const settingsTab = document.getElementById('settings-tab');
    const settingsContent = document.getElementById('settings'); // Matches the ID added in HTML
    const userStatusSpan = document.getElementById('user-status');
    const signInButton = document.getElementById('sign-in-button');
    const signOutButton = document.getElementById('sign-out-button');
    const syncStatusParagraph = document.getElementById('sync-status');

    // Function to switch tabs
    function switchTab(tabId) {
        console.log(`[Popup] Switching to tab: ${tabId}`);
        // Deactivate all tabs
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activate the selected tab
        const selectedTabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const selectedTabContent = document.getElementById(tabId);

        if (selectedTabButton) selectedTabButton.classList.add('active');
        if (selectedTabContent) selectedTabContent.classList.add('active');

        // Specific actions when switching to certain tabs
        if (tabId === 'sessions') {
            console.log('[Popup] Sessions tab selected. Fetching sessions...');
            // Ensure the resultDiv element exists
            const sessionListDiv = document.getElementById('sessionList'); 
            if (sessionListDiv) {
                // Pass the required functions and the result div
                fetchAndDisplaySessions(
                    addOrUpdatePlayer, // Pass the imported function
                    createUsernameHistoryModal, // Pass the imported function
                    updateOnlineFavoritesList, // Pass the function defined in this scope
                    sessionListDiv, // Pass the target div element
                    currentFilterOptions // Pass current filter state if needed by fetch
                ).catch(error => {
                    console.error("Error fetching/displaying sessions on tab switch:", error);
                    if(sessionListDiv) sessionListDiv.innerHTML = `<div class="error-message">Error loading sessions: ${error.message}</div>`;
                });
            } else {
                console.error('Session list container (sessionList) not found!');
            }
        } else if (tabId === 'userManagement') {
            console.log('[Popup] User Management tab selected. Refreshing view...');
            refreshUserManagementTab(); // Use the helper function
        } else if (tabId === 'settings') {
            console.log('[Popup] Settings tab selected. Initializing...');
            initializeSettingsTab(); // Initialize settings tab content
        }
        // Add other tab-specific logic here if needed
    }

    // Event listeners for tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // --- Settings Tab Logic ---
    function initializeSettingsTab() {
        console.log('[Popup Settings] Initializing settings tab...');
        // Send message to background to get current auth state
        chrome.runtime.sendMessage({ action: 'GET_AUTH_STATE' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("[Popup Settings] Error getting auth state:", chrome.runtime.lastError.message);
                updateAuthUI(null); // Assume signed out on error
            } else if (response && response.type === 'AUTH_STATE_CHANGED') {
                console.log('[Popup Settings] Received initial auth state:', response.user);
                updateAuthUI(response.user); // Update UI with current state
            } else {
                console.warn('[Popup Settings] Unexpected response format for GET_AUTH_STATE');
                updateAuthUI(null);
            }
        });
    }

    function updateAuthUI(user) {
        if (user) {
            // User is signed in (Google or potentially Anonymous for a moment)
            userStatusSpan.textContent = `Signed in (${user.isAnonymous ? 'Anonymous' : user.email || 'Google User'})`;
            signInButton.style.display = 'none';
            signOutButton.style.display = 'block';
        } else {
            // User is signed out
            userStatusSpan.textContent = 'Signed Out';
            signInButton.style.display = 'block';
            signOutButton.style.display = 'none';
        }
    }

    signInButton.addEventListener('click', async () => { 
        console.log('[Popup Settings] Sign-in button clicked.');
        const auth = getAuth(); // Get auth instance

        try {
            // 1. Get Google Access Token using Chrome Identity API
            console.log('[Popup Settings] Requesting Google token via chrome.identity...');
            const tokenResponse = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ interactive: true }, (token) => {
                    if (chrome.runtime.lastError || !token) {
                        // Handle errors, including user cancellation
                        reject(chrome.runtime.lastError || new Error('No token received or user cancelled.'));
                    } else {
                        resolve(token);
                    }
                });
            });
            const accessToken = tokenResponse;
            console.log('[Popup Settings] Received Google access token.');

            // 2. Create Firebase credential using the access token
            // NOTE: This assumes Firebase can use the access token directly.
            // If this step fails with an auth/invalid-credential error, we might need an ID token instead.
            const credential = GoogleAuthProvider.credential(null, accessToken);
            console.log('[Popup Settings] Created Firebase credential.');

            // 3. Sign in to Firebase with the credential
            console.log('[Popup Settings] Signing into Firebase...');
            const userCredential = await signInWithCredential(auth, credential);
            console.log('[Popup Settings] Firebase sign-in successful:', userCredential.user);
            updateAuthUI(userCredential.user); // Update UI

            // Optional: Notify background script about successful sign-in if needed
            chrome.runtime.sendMessage({ action: "USER_SIGNED_IN", payload: { uid: userCredential.user.uid, email: userCredential.user.email } });

        } catch (error) {
            // Enhanced error logging
            console.error('[Popup Settings] Google Sign-in failed. Raw error object:', error);
            console.error('[Popup Settings] Error Message:', error && error.message ? error.message : 'No message available');
            console.error('[Popup Settings] Error Stack:', error && error.stack ? error.stack : 'No stack available');
            console.error('[Popup Settings] Error Code:', error && error.code ? error.code : 'No code available');

            // Update UI based on error details
            let errorMessage = 'Sign-in failed. See console for details.'; // Default message
            if (error && error.message) {
                if (error.message.includes("cancelled by the user") || error.message.includes("user cancelled") || error.message.includes("No token received")) {
                    errorMessage = 'Sign-in cancelled or token not received.';
                } else {
                    errorMessage = `Sign-in failed: ${error.message}`;
                }
            } else if (error && error.code === 'auth/invalid-credential') {
                 errorMessage = 'Sign-in failed: Invalid credentials.';
            }
            // Use the more specific message if available, otherwise the generic one
            userStatusSpan.textContent = errorMessage;

            updateAuthUI(null); // Ensure UI reflects signed-out state on error
        }
    });

    signOutButton.addEventListener('click', () => {
        console.log('[Popup Settings] Sign-out button clicked.');
        // Send message to background script to initiate Sign-out
        userStatusSpan.textContent = 'Signing out...'; 
        chrome.runtime.sendMessage({ action: 'SIGN_OUT_FIREBASE' }, (response) => {
             // Background handles auth via listener, popup updates via AUTH_STATE_CHANGED message
             if (chrome.runtime.lastError) {
                 console.error("[Popup Settings] Error sending SIGN_OUT_FIREBASE:", chrome.runtime.lastError.message);
                 initializeSettingsTab(); // Re-check state on error
             }
        });
    });

    function updateSyncStatus(message) {
        syncStatusParagraph.textContent = message;
        // Optional: Clear the message after a few seconds
        // setTimeout(() => { syncStatusParagraph.textContent = ''; }, 5000);
    }

    // --- Message Listener (for messages FROM background) ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('[Popup Listener] Received message:', message.type);
        switch (message.type) {
            case 'SESSION_DATA_UPDATED':
                console.log('[Popup Listener] Session data updated, refreshing display.');
                refreshDisplayedSessions(); // Refresh the session list if visible
                break;
            case 'AUTH_STATE_CHANGED':
                console.log('[Popup Listener] Auth state changed:', message.payload);
                updateAuthUI(message.payload); // Update login/logout buttons
                // Potentially refresh data or tabs based on auth state
                break;
            case 'PLAYER_DATA_LOADED': // Ensure background sends this after initial load/sync
                console.log('[Popup Listener] Player data loaded from background.');
                window.playerData = message.payload;
                // Refresh relevant UI elements if they are active
                const activeTabContent = document.querySelector('.tab-content.active');
                if (activeTabContent && activeTabContent.id === 'userManagement') {
                    refreshUserManagementTab();
                }
                break;
            case 'CURRENT_GAME_INFO': // Handle the message from background
                console.log('[Popup Listener] Received CURRENT_GAME_INFO:', message.payload);
                // TODO: Decide what to do with this info (e.g., display it somewhere)
                break;
            default:
                console.log('[Popup Listener] Received unhandled message type:', message.type);
                break;
        }
        // Return true if you need to send an asynchronous response (usually not needed for listeners)
        // return true;
    });
});