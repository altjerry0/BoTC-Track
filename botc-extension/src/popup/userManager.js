/**
 * User Manager Module
 * Handles all user-related functionality including:
 * - Storing and retrieving user data
 * - Username history tracking
 * - User interface for managing players
 */

// Store reference to player data
let allPlayerData = null;

/**
 * Load player data from Chrome storage.
 * Initializes the in-memory cache (allPlayerData) if it's null.
 * @returns {Promise<Object>} A deep copy of the player data object.
 */
async function loadPlayerData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('playerData', (result) => {
            if (chrome.runtime.lastError) {
                console.error('[User Manager] Error loading player data:', chrome.runtime.lastError.message);
                return reject(chrome.runtime.lastError);
            }
            const data = result.playerData || {};
            if (allPlayerData === null) { // Initialize cache on first load
                allPlayerData = JSON.parse(JSON.stringify(data)); // Deep copy for cache initialization
            }
            // Always return a deep copy to prevent external modification of the cache
            resolve(JSON.parse(JSON.stringify(allPlayerData || data))); 
        });
    });
}

/**
 * Saves player data to both the in-memory cache and chrome.storage.local.
 * @param {Object} playerDataToSave - The player data object to save.
 * @returns {Promise<void>}
 */
async function savePlayerData(playerDataToSave) {
    return new Promise((resolve, reject) => {
        allPlayerData = JSON.parse(JSON.stringify(playerDataToSave)); // Update the in-memory cache with a deep copy
        chrome.storage.local.set({ playerData: allPlayerData }, () => {
            if (chrome.runtime.lastError) {
                console.error('[User Manager] Error saving player data:', chrome.runtime.lastError.message);
                // Optionally: Display a user-friendly error message here
                // ModalManager.showNotification("Error saving player data. Changes might not persist.", true, 5000);
                return reject(chrome.runtime.lastError);
            }
            // console.log('[User Manager] Player data saved successfully to storage and cache updated.');
            resolve();
        });
    });
}

/**
 * Retrieves a deep copy of all player data from the in-memory cache.
 * Loads it from storage if the cache is not yet initialized.
 * @returns {Promise<Object>} A deep copy of the player data.
 */
async function getAllPlayerData() {
    if (allPlayerData === null) {
        await loadPlayerData(); // Ensure cache is initialized
    }
    return JSON.parse(JSON.stringify(allPlayerData || {})); // Return deep copy of cache or empty object
}

/**
 * Load player data from Chrome storage.
 * @returns {Promise<Object>} A promise that resolves with the player data object.
 */
async function loadPlayerData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('playerData', (data) => {
            if (chrome.runtime.lastError) {
                console.error("Error loading playerData from storage:", chrome.runtime.lastError.message);
                // Resolve with an empty object in case of error to prevent breaking subsequent logic
                allPlayerData = {};
                resolve({});
            } else {
                allPlayerData = data.playerData || {};
                resolve(allPlayerData);
            }
        });
    });
}

/**
 * Save player data to Chrome storage.
 * @param {Object} playerData - Player data to save.
 * @returns {Promise<void>} A promise that resolves when saving is complete.
 */
async function savePlayerData(playerData) {
    return new Promise((resolve, reject) => {
        allPlayerData = playerData; // Update local cache immediately
        chrome.storage.local.set({ playerData }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving playerData to storage:", chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
            } else {
                resolve(); // Resolve promise on successful save
            }
        });
    });
}

/**
 * Format timestamp to readable date and time
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted date and time
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Formats a timestamp into a human-readable 'time ago' string.
 * e.g., "5 minutes ago", "2 hours ago", "3 days ago".
 * @param {number} timestamp - The Unix timestamp in milliseconds.
 * @returns {string} A human-readable string representing the time since the timestamp, or "Not seen yet" if timestamp is invalid.
 */
function formatTimeSince(timestamp) {
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
        return "Not seen yet";
    }

    const now = Date.now();
    const seconds = Math.round((now - timestamp) / 1000);

    if (seconds < 0) { // Timestamp is in the future
        return "In the future"; // Or handle as an error/default
    }
    if (seconds < 60) {
        return seconds + " sec ago";
    }

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return minutes + (minutes === 1 ? " min ago" : " mins ago");
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
        return hours + (hours === 1 ? " hour ago" : " hours ago");
    }

    const days = Math.round(hours / 24);
    if (days < 30) {
        return days + (days === 1 ? " day ago" : " days ago");
    }

    const months = Math.round(days / 30);
    if (months < 12) {
        return months + (months === 1 ? " month ago" : " months ago");
    }

    const years = Math.round(months / 12);
    return years + (years === 1 ? " year ago" : " years ago");
}

/**
 * Create modal to display username history
 * @param {Array} history - Array of username history entries
 * @param {string} currentName - Current username
 */
function createUsernameHistoryModal(history, currentName) {
    // Remove any existing modal first to prevent duplicates
    const existingModal = document.querySelector('.username-history-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'username-history-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'username-history-content';

    const closeButton = document.createElement('span');
    closeButton.className = 'username-history-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => document.body.removeChild(modal);

    const title = document.createElement('h2');
    title.className = 'username-history-title';
    title.textContent = 'Username History';

    const currentNameElement = document.createElement('div');
    currentNameElement.className = 'username-history-current';
    currentNameElement.innerHTML = `<strong>Current:</strong> <span style="font-weight: bold;">${currentName}</span>`;

    const historyList = document.createElement('div');
    historyList.className = 'username-history-list';

    if (history && history.length > 0) {
        history.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'username-history-item';

            const nameElement = document.createElement('span');
            nameElement.className = 'username-history-name';
            if (entry.oldName && entry.newName) {
                historyItem.classList.add('username-history-change');
                nameElement.innerHTML = `<span class="old-name">${entry.oldName}</span><span class="arrow"> &rarr; </span><span class="new-name">${entry.newName}</span>`;
            } else {
                nameElement.textContent = entry.name || entry.username || 'Unknown Change';
            }

            const timeElement = document.createElement('span');
            timeElement.className = 'username-history-time';
            timeElement.textContent = formatTimestamp(entry.timestamp);

            historyItem.appendChild(nameElement);
            historyItem.appendChild(timeElement);
            historyList.appendChild(historyItem);
        });
    } else {
        const noHistory = document.createElement('p');
        noHistory.textContent = 'No history available.';
        historyList.appendChild(noHistory);
    }

    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(currentNameElement);
    modalContent.appendChild(historyList);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // Close when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Compares two players for sorting according to specific criteria:
 * 1. Online Favorite players first (sorted by rating desc, then name asc).
 * 2. Online Non-Favorite players next (sorted by rating desc, then name asc).
 * 3. Offline players last (sorted by lastSeenTimestamp desc (recent first, no data last), then rating desc, then name asc).
 * @param {Array} a - First player entry: [idString, playerObjectA]
 * @param {Array} b - Second player entry: [idString, playerObjectB]
 * @param {Set<string>} onlinePlayerIds - Set of IDs for players currently online.
 * @returns {number} -1 if a < b, 1 if a > b, 0 if a === b.
 */
function comparePlayersForSorting(a, b, onlinePlayerIds) {
    const idA = a[0];
    const playerAData = a[1];
    const idB = b[0];
    const playerBData = b[1];

    const isOnlineA = onlinePlayerIds.has(idA.toString());
    const isOnlineB = onlinePlayerIds.has(idB.toString());

    const isFavoriteA = playerAData.isFavorite || false;
    const isFavoriteB = playerBData.isFavorite || false;

    // Priority 1: Online AND Favorite
    const aIsOnlineFav = isOnlineA && isFavoriteA;
    const bIsOnlineFav = isOnlineB && isFavoriteB;

    if (aIsOnlineFav !== bIsOnlineFav) {
        return aIsOnlineFav ? -1 : 1; // OnlineFav (true) comes before not OnlineFav (false)
    }
    if (aIsOnlineFav && bIsOnlineFav) { // Both are Online + Favorite
        // Sub-sort by rating (desc)
        const scoreA = playerAData.score !== undefined && playerAData.score !== null ? Number(playerAData.score) : -Infinity;
        const scoreB = playerBData.score !== undefined && playerBData.score !== null ? Number(playerBData.score) : -Infinity;
        if (scoreA !== scoreB) {
            return scoreB - scoreA; // Higher score first
        }
        // Then by name (asc)
        return (playerAData.name || '').localeCompare(playerBData.name || '');
    }

    // Priority 2: Online (but not favorite, or only one is favorite - handled above)
    if (isOnlineA !== isOnlineB) {
        return isOnlineA ? -1 : 1; // Online (true) comes before offline (false)
    }

    if (isOnlineA) { // Both are Online (but not both Online+Favorite)
        // Sort by rating (desc)
        const scoreA = playerAData.score !== undefined && playerAData.score !== null ? Number(playerAData.score) : -Infinity;
        const scoreB = playerBData.score !== undefined && playerBData.score !== null ? Number(playerBData.score) : -Infinity;
        if (scoreA !== scoreB) {
            return scoreB - scoreA;
        }
        // Then by name (asc)
        return (playerAData.name || '').localeCompare(playerBData.name || '');
    }

    // Priority 3: Both are Offline
    // Sort by lastSeenTimestamp (desc - recent first)
    // Treat null/undefined/0 as very old to push them to the bottom of offline players
    const lastSeenA = playerAData.lastSeenTimestamp || 0;
    const lastSeenB = playerBData.lastSeenTimestamp || 0;
    if (lastSeenA !== lastSeenB) {
        return lastSeenB - lastSeenA; // More recent (higher timestamp) first
    }

    // If lastSeen is same (or both unknown), sort by rating (desc)
    const scoreA = playerAData.score !== undefined && playerAData.score !== null ? Number(playerAData.score) : -Infinity;
    const scoreB = playerBData.score !== undefined && playerBData.score !== null ? Number(playerBData.score) : -Infinity;
    if (scoreA !== scoreB) {
        return scoreB - scoreA;
    }

    // Finally, by name (asc)
    return (playerAData.name || '').localeCompare(playerBData.name || '');
}

/**
 * Helper function to extract a Set of online player IDs from session data.
 * @param {Array|Set|null} sessionData - Active session data or a Set of online IDs.
 * @returns {Set<string>} A Set of player IDs that are currently online.
 */
function getOnlinePlayerIds(sessionData) {
    const onlinePlayerIds = new Set();
    if (sessionData && Array.isArray(sessionData)) {
        sessionData.forEach(session => {
            if (session && session.usersAll && Array.isArray(session.usersAll)) {
                session.usersAll.forEach(user => {
                    if (user && user.id && user.isOnline) {
                        onlinePlayerIds.add(user.id.toString());
                    }
                });
            }
        });
    } else if (sessionData instanceof Set) {
        sessionData.forEach(id => onlinePlayerIds.add(id.toString()));
    }
    return onlinePlayerIds;
}

/**
 * Displays known players in the specified container, filtered by search term and indicating online status.
 * @param {HTMLElement} container - The container element to display players in.
 * @param {string} [searchTerm=''] - Optional search term to filter players.
 * @param {Object} playerData - The player data object.
 * @param {Set<string>} onlinePlayerIds - A Set containing the IDs of currently online players.
 * @param {Function} createUsernameHistoryModalFunc - Function to create the history modal.
 * @param {Function} refreshCallback - Callback to refresh the list after edits or favorite changes.
 */
async function displayKnownPlayers(container, searchTerm = '', playerData, onlinePlayerIds, createUsernameHistoryModalFunc, refreshCallback) {
    console.log('[displayKnownPlayers] onlinePlayerIds:', onlinePlayerIds);
    const lowerSearchTerm = searchTerm ? searchTerm.toLowerCase() : ''; // Define lowerSearchTerm here
    container.innerHTML = ''; // Clear previous results

    // Filter and then sort the player data
    const filteredPlayersArray = Object.entries(playerData)
        .filter(([id, player]) => {
            const nameMatch = player.name && player.name.toLowerCase().includes(lowerSearchTerm);
            const notesMatch = player.notes && player.notes.toLowerCase().includes(lowerSearchTerm);
            const scoreMatch = player.score !== undefined && player.score.toString().toLowerCase().includes(lowerSearchTerm);
            const idMatch = id.toLowerCase().includes(lowerSearchTerm);
            return nameMatch || notesMatch || scoreMatch || idMatch;
        });

    // Sort the filtered array using the new comparison function
    const sortedPlayersArray = filteredPlayersArray.sort((a, b) => comparePlayersForSorting(a, b, onlinePlayerIds));

    if (sortedPlayersArray.length === 0 && searchTerm) {
        container.innerHTML = '<p>No players match your search.</p>';
        return;
    }
    if (sortedPlayersArray.length === 0) {
        container.innerHTML = '<p>No players known. Add some!</p>';
        return;
    }

    // For each player, create a card
    sortedPlayersArray.forEach(([id, player]) => { // Corrected: Destructure id and player here
        const card = document.createElement('div');
        card.className = 'player-card known-player';
        card.dataset.playerId = id;

        // Add rating class for styling
        card.classList.add(getRatingClass(player.score));

        const isOnline = onlinePlayerIds.has(id.toString()); // Correctly use destructured id
        let hasMetaInfo = false; // Declare hasMetaInfo here for broader scope within the loop iteration

        if (isOnline) {
            card.classList.add('online');
        }
        if (player.isFavorite) {
            card.classList.add('favorite-player');
        }

        // --- Player Info Container ---
        const infoContainer = document.createElement('div');
        infoContainer.className = 'player-info-container';

        if (isOnline) {
            const nameElement = document.createElement('strong');
            nameElement.textContent = player.name || `Player ${id}`;
            infoContainer.appendChild(nameElement);

            const idElement = document.createElement('small');
            idElement.textContent = ` (ID: ${id})`;
            idElement.style.color = 'var(--subtle-text-color)';
            infoContainer.appendChild(idElement);

            let sessionName = null;
            if (player.lastSeenSessionId) { 
                sessionName = player.lastSeenSessionId;
            }

            const onlineBadge = document.createElement('span');
            onlineBadge.classList.add('online-indicator');
            onlineBadge.title = 'Online';
            infoContainer.appendChild(onlineBadge);

            if (sessionName) {
                const sessionNameSpan = document.createElement('small');
                sessionNameSpan.style.color = 'var(--accent-color)';
                sessionNameSpan.style.marginLeft = '5px';
                sessionNameSpan.textContent = ` (in: ${sessionName})`;
                infoContainer.appendChild(sessionNameSpan);
            }
        } else {
            // Offline player name and ID (similar to online, but no badge or current session name)
            const nameElement = document.createElement('strong');
            nameElement.textContent = player.name || `Player ${id}`;
            infoContainer.appendChild(nameElement);
    
            const idElement = document.createElement('small');
            idElement.textContent = ` (ID: ${id})`;
            idElement.style.color = 'var(--subtle-text-color)';
            infoContainer.appendChild(idElement);
        }

        // Create a container for meta info (Sessions, Last Seen) - applies to ALL players
        const metaInfoContainer = document.createElement('div');
        metaInfoContainer.className = 'player-meta-info';

        let addedSessionInfo = false;
        // Add session count information (for ALL players if available)
        if (player.lastSeenSessionId) { 
            const sessionInfoText = document.createElement('span');
            sessionInfoText.textContent = `Sessions: ${player.uniqueSessionCount || 1}`;
            sessionInfoText.style.color = 'var(--subtle-text-color)';
            metaInfoContainer.appendChild(sessionInfoText);
            hasMetaInfo = true;
            addedSessionInfo = true;
        }

        // Handle offline player last seen time (ONLY for offline players)
        if (!isOnline && player.lastSeenTimestamp) { 
            if (addedSessionInfo) { // Add a separator if session info was already added
                const separator = document.createElement('span');
                separator.textContent = ' | ';
                separator.style.color = 'var(--subtle-text-color)';
                separator.style.marginLeft = '5px'; 
                separator.style.marginRight = '5px';
                metaInfoContainer.appendChild(separator);
            }
            const lastSeenTextContent = formatTimeSince(player.lastSeenTimestamp);
            const lastSeenElement = document.createElement('span');
            lastSeenElement.textContent = `Last seen: ${lastSeenTextContent}`;
            lastSeenElement.className = 'last-seen-text'; 
            lastSeenElement.style.color = 'var(--subtle-text-color)';
            metaInfoContainer.appendChild(lastSeenElement);
            hasMetaInfo = true;
        }

        if (hasMetaInfo) {
            infoContainer.appendChild(metaInfoContainer);
        }
        
        const scoreElement = document.createElement('span');
        scoreElement.textContent = `Score: ${player.score !== undefined ? player.score : 'N/A'}/5`;
        scoreElement.style.display = 'block'; // Make score take its own line after meta info
        scoreElement.style.marginTop = hasMetaInfo ? '5px' : '0'; // Now hasMetaInfo should be defined
        infoContainer.appendChild(scoreElement);

        if (player.notes) {
            const notesElement = document.createElement('p');
            notesElement.textContent = `Notes: ${player.notes}`;
            notesElement.className = 'player-notes';
            // Check if notes already contain session count to avoid duplication if logic is complex
            // For now, assuming session count is primarily handled by the new metaInfoContainer
            infoContainer.appendChild(notesElement);
        }

        card.appendChild(infoContainer);

        // --- Player Actions (Buttons) ---
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'player-actions'; // Updated class for consistency

        // Favorite Button
        const favoriteButton = document.createElement('button');
        favoriteButton.classList.add('player-action-button', 'favorite-button'); // Ensure player-action-button is present
        favoriteButton.innerHTML = player.isFavorite ? '★' : '☆'; // Updated Star icons
        favoriteButton.title = player.isFavorite ? 'Unfavorite Player' : 'Favorite Player';
        favoriteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavoriteStatus(id, favoriteButton, player); // Pass player object
            // No need to call refreshCallback here if toggleFavoriteStatus handles UI update
        });
        buttonContainer.appendChild(favoriteButton);

        // Edit Button
        const editButton = document.createElement('button');
        editButton.classList.add('player-action-button');
        editButton.innerHTML = `<img src="../icons/editbutton.svg" alt="Edit" class="button-icon">`;
        editButton.title = 'Edit Player';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            editPlayerDetails(id);
        });
        buttonContainer.appendChild(editButton);

        // History Button (if history exists)
        if (player.usernameHistory && player.usernameHistory.length > 0) {
            const historyButton = document.createElement('button');
            historyButton.classList.add('player-action-button'); // Removed 'history-button' class
            historyButton.innerHTML = `🕒`; // Updated Clock icon
            historyButton.title = `View Username History (${player.usernameHistory.length} entries)`;
            historyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                createUsernameHistoryModalFunc(player.usernameHistory, player.name);
            });
            buttonContainer.appendChild(historyButton);
        }

        // Refresh Username Button (only if player has an ID, which they should)
        const refreshUsernameButton = document.createElement('button');
        refreshUsernameButton.classList.add('player-action-button'); // Removed 'refresh-username-button' class
        refreshUsernameButton.innerHTML = '🔄'; // Updated Refresh icon
        refreshUsernameButton.title = 'Refresh Username from Server';
        refreshUsernameButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRefreshUserName(id, refreshUsernameButton, refreshCallback);
        });
        buttonContainer.appendChild(refreshUsernameButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('player-action-button');
        deleteButton.innerHTML = `<img src="../icons/deletebutton.svg" alt="Delete" class="button-icon">`;
        deleteButton.title = 'Delete Player';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePlayer(id, () => { // Pass the refreshCallback to the version of deletePlayer that accepts it.
                // console.log("Player deleted, attempting to refresh list after modal confirmation.");
                if (typeof refreshCallback === 'function') {
                    refreshCallback();
                }
            });
        });
        buttonContainer.appendChild(deleteButton);

        card.appendChild(infoContainer);
        card.appendChild(buttonContainer);

        container.appendChild(card);
    });
}

/**
 * Add or update a player in the data
 * @param {string} id - Player ID
 * @param {string} name - Player name
 * @param {number} score - Player rating
 * @param {string} notes - Player notes
 * @param {boolean} isFavorite - Player favorite status
 * @param {Function} [updateUICallback] - Optional callback to execute after saving, receives updated player data
 */
async function addPlayer(id, name, score, notes, isFavorite, updateUICallback) {
    // Validate score input
    const parsedScore = parseInt(score, 10);
    const finalScore = !isNaN(parsedScore) && parsedScore >= -5 && parsedScore <= 5 ? parsedScore : null;

    const playerData = await loadPlayerData();

    if (!id) {
        console.error('Attempted to add player with no ID.');
        return; // Cannot add a player without an ID
    }

    // Check if player exists for potential update
    const isUpdate = !!playerData[id];
    const oldPlayerData = isUpdate ? { ...playerData[id] } : null;

    // Preserve or initialize username history
    let usernameHistory = (isUpdate && playerData[id].usernameHistory) ? [...playerData[id].usernameHistory] : [];
    // Preserve or initialize session history
    let sessionHistoryArray = (isUpdate && Array.isArray(playerData[id].sessionHistory)) ? [...playerData[id].sessionHistory] : [];
    let uniqueSessionCount = (isUpdate && typeof playerData[id].uniqueSessionCount === 'number') ? playerData[id].uniqueSessionCount : 0;
    let lastSeenSessionId = (isUpdate && playerData[id].lastSeenSessionId) ? playerData[id].lastSeenSessionId : null;
    let lastSeenTimestamp = (isUpdate && playerData[id].lastSeenTimestamp) ? playerData[id].lastSeenTimestamp : null;

    // Determine the new favorite status
    let newIsFavoriteValue;
    if (isUpdate) {
        // For updates, use the provided 'isFavorite' parameter if it's a boolean, otherwise keep the existing one.
        newIsFavoriteValue = (typeof isFavorite === 'boolean') ? isFavorite : playerData[id].isFavorite;
    } else {
        // For new players, use the provided 'isFavorite' parameter if it's a boolean, otherwise default to false.
        newIsFavoriteValue = (typeof isFavorite === 'boolean') ? isFavorite : false;
    }

    // If updating, check if name changed and update history
    if (isUpdate && playerData[id].name !== name) {
        // console.log(`Updating name for ${id}: "${playerData[id].name}" -> "${name}"`);
        usernameHistory.unshift({ username: playerData[id].name, timestamp: Date.now() });
        // Limit history size if needed (e.g., keep last 10)
        if (usernameHistory.length > 10) {
             usernameHistory = usernameHistory.slice(0, 10);
        }
    }

    // Update or create player data
    playerData[id] = {
        id: id,
        name: name,
        score: finalScore,
        notes: notes || (isUpdate ? playerData[id].notes : ''),
        usernameHistory: usernameHistory,
        sessionHistory: sessionHistoryArray, 
        uniqueSessionCount: uniqueSessionCount,
        lastSeenSessionId: lastSeenSessionId,
        lastSeenTimestamp: lastSeenTimestamp,
        isFavorite: newIsFavoriteValue 
    };

    await savePlayerData(playerData);

    // Pass the updated data for this specific player to the callback
    if (updateUICallback && typeof updateUICallback === 'function') {
        // Ensure the callback receives the full updated player data, including isFavorite
        updateUICallback(playerData[id]);
    }
}

/**
 * Checks if a player's username from a session differs from the stored one.
 * If it differs, updates the username and history in storage.
 * @param {string} userId - The ID of the player.
 * @param {string} sessionUsername - The username found in the current session data.
 * @param {Object} currentPlayerData - The currently loaded player data object.
 * @param {Function} callback - Callback function, receives (wasUpdated: boolean, updatedPlayerData: Object).
 */
async function updateUsernameHistoryIfNeeded(userId, sessionUsername, currentPlayerData) {
    const player = currentPlayerData[userId];
    let updatedData = { ...currentPlayerData }; // Work on a copy
    let needsSave = false;

    // If player isn't known at all, we can't update history (should be added first)
    if (!player) {
        return false;
    }

    // Initialize history if it doesn't exist
    if (!player.usernameHistory) {
        player.usernameHistory = [];
        needsSave = true; // Need to save if we initialize the array structure
    }

    const currentStoredName = player.name;
    const history = player.usernameHistory;

    // Check if the session username is different from the currently stored name
    if (sessionUsername && currentStoredName !== sessionUsername) {
        // Check if this session username is already the *latest* in history (avoids redundant entries)
        const latestHistoryEntry = history.length > 0 ? history[history.length - 1] : null;
        
        // Add the *previous* name to history only if it's not already the latest entry
        if (!latestHistoryEntry || latestHistoryEntry.username !== currentStoredName) {
            history.push({ username: currentStoredName, timestamp: Date.now() });
            // console.log(`[Username History] Added '${currentStoredName}' to history for player ${player.id}. New name: '${sessionUsername}'.`);
            needsSave = true;
        }

        // Update the player's current name to the new one from the session
        player.name = sessionUsername;
        needsSave = true;
    } else {
        // If names match, ensure the current name is at least the first entry if history is empty
        if (history.length === 0 && currentStoredName) {
            history.push({ username: currentStoredName, timestamp: Date.now() });
            needsSave = true;
        }
    }

    // If any changes occurred that require saving
    if (needsSave) {
        await savePlayerData(updatedData);
        return true;
    } else {
        return false;
    }
}

/**
 * Checks if a player is seen in a new session compared to the last recorded one.
 * If it's a new session, increments the unique session count and updates the last seen ID.
 * @param {string} userId - The ID of the player.
 * @param {string} currentSessionId - The ID of the session the player was just seen in.
 * @param {Object} currentPlayerData - The currently loaded player data object.
 * @param {Function} callback - Callback function, receives (wasUpdated: boolean, updatedPlayerData: Object).
 */
async function updateSessionHistoryIfNeeded(userId, currentSessionId, currentPlayerData) {
    if (!userId || !currentSessionId) {
        return false;
    }

    let player = currentPlayerData[userId];
    if (!player) {
        return false;
    }

    let changed = false;

    // Initialize session tracking fields if they don't exist
    if (!Array.isArray(player.sessionHistory)) {
        player.sessionHistory = [];
        changed = true; // Mark as changed if we initialize this
    }
    if (typeof player.uniqueSessionCount !== 'number') { // Also ensure uniqueSessionCount is a number
        player.uniqueSessionCount = player.sessionHistory.length; // Or 0 if sessionHistory was also just init'd
        changed = true; // Mark as changed
    }
    // Ensure lastSeenSessionId exists, though it will be updated shortly if different
    if (player.lastSeenSessionId === undefined) {
        player.lastSeenSessionId = null;
        changed = true;
    }
    // Ensure lastSeenTimestamp exists
    if (player.lastSeenTimestamp === undefined) {
        player.lastSeenTimestamp = null;
        changed = true;
    }


    // Add current session ID if it's not already in the history
    if (!player.sessionHistory.includes(currentSessionId)) {
        player.sessionHistory.push(currentSessionId);
        changed = true;
    }

    // Update unique session count based on the length of the (now potentially updated) sessionHistory array
    const newUniqueSessionCount = player.sessionHistory.length;
    if (player.uniqueSessionCount !== newUniqueSessionCount) {
        player.uniqueSessionCount = newUniqueSessionCount;
        changed = true;
    }

    // Update lastSeenSessionId (could be the same as current if it's a repeat, or new)
    if (player.lastSeenSessionId !== currentSessionId) {
        player.lastSeenSessionId = currentSessionId;
        changed = true;
    }

    // Always update lastSeenTimestamp if processing this player from a session
    const newTimestamp = Date.now();
    if (player.lastSeenTimestamp !== newTimestamp) { // Could be redundant if always updating, but good for explicitness
        player.lastSeenTimestamp = newTimestamp;
        changed = true;
    }

    if (changed) {
        await savePlayerData({ ...currentPlayerData, [userId]: player });
        return true;
    } else {
        return false;
    }
}

/**
 * Helper function to get CSS class based on player rating.
 * Ensures rating is clamped between 1 and 5 for class generation.
 * @param {number|string} rating - Player rating.
 * @returns {string} CSS class name (e.g., 'rating-3', 'rating-unknown').
 */
function getRatingClass(rating) {
    if (rating === null || rating === undefined || rating === '') return 'rating-unknown';
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating)) return 'rating-unknown';
    const validRating = Math.max(1, Math.min(5, numRating));
    return `rating-${validRating}`;
}

/**
 * Adds a new player manually using their ID.
 * @param {string} playerId - The unique ID of the player.
 * @param {string} initialName - The initial name to assign.
 * @param {string|number} initialScore - The initial score (validated later).
 * @param {string} initialNotes - The initial notes.
 * @param {function} [callback] - Optional callback after saving.
 */


// -- START: Data Management & Utility --

/**
 * Replaces all player data in memory and saves it to Chrome storage.
 * @param {Object} newData - The new player data object to replace the current data.
 * @param {Function} [callback] - Optional callback to execute after saving.
 */
async function replaceAllPlayerDataAndSave(newData, callback) {
    console.log('[userManager] Clearing all player data');
    try {
        // Force a direct removal from Chrome storage to ensure it's fully cleared
        await new Promise((resolve, reject) => {
            chrome.storage.local.remove('playerData', () => {
                if (chrome.runtime.lastError) {
                    console.error('[userManager] Error removing playerData from storage:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('[userManager] Successfully removed playerData from storage');
                    resolve();
                }
            });
        });
        
        // Now set the memory cache and save the new (empty) data
        allPlayerData = newData || {}; // Replace in-memory store, ensure it's an object
        
        // Save the empty data object
        await new Promise((resolve, reject) => {
            chrome.storage.local.set({ playerData: allPlayerData }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[userManager] Error saving empty playerData:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('[userManager] Successfully saved empty playerData');
                    resolve();
                }
            });
        });
        
        console.log('[userManager] All player data cleared successfully');
        
        // Call the callback with success=true if provided
        if (typeof callback === 'function') {
            callback(true);
        }
        return true;
    } catch (error) {
        console.error('[userManager] Error clearing player data:', error);
        
        // Call the callback with success=false if provided
        if (typeof callback === 'function') {
            callback(false);
        }
        return false;
    }
}

// -- START: Initialization & Utility --

/**
 * Toggles the favorite status of a player and updates storage and UI.
 * @param {string} playerId - The ID of the player.
 * @param {HTMLElement} buttonElement - The button element to update.
 * @param {Object} [playerObject] - Optional: The player object, to update its isFavorite status directly for immediate UI feedback.
 */
async function toggleFavoriteStatus(playerId, buttonElement, playerObject) {
    const playerData = await loadPlayerData();

    if (!playerData[playerId]) {
        console.warn(`Player ${playerId} not found for toggling favorite.`);
        ModalManager.showNotification(`Player ${playerId} not found.`, true, 3000);
        return;
    }

    playerData[playerId].isFavorite = !playerData[playerId].isFavorite;
    if (playerObject) { // Update the passed object for immediate UI consistency if provided
        playerObject.isFavorite = playerData[playerId].isFavorite;
    }

    await savePlayerData(playerData);

    // Update button text/appearance
    if (buttonElement) {
        buttonElement.textContent = playerData[playerId].isFavorite ? '★ Unfavorite' : '☆ Favorite';
        buttonElement.classList.toggle('favorite-active', playerData[playerId].isFavorite);
    }
    // Trigger a refresh of the list or relevant UI part
    // This needs to be handled by the caller or a passed-in refresh function
    // For now, assume popup.js handles refresh via its own mechanisms after this callback if needed
    // If a global refresh function is available, call it here:
    // e.g., if (typeof refreshUserManagementTab === 'function') refreshUserManagementTab();
    // Or, more robustly, the function that calls toggleFavoriteStatus should handle refresh.
}

/**
 * Deletes a player from the stored data.
 * @param {string} playerId - The ID of the player to delete.
 * @param {Function} callback - Function to call after deletion attempt (receives success: boolean, deletedPlayerId: string|null, message: string).
 */
async function deletePlayer(playerId, callback) {
    ModalManager.showConfirm(
        'Delete Player',
        `Are you sure you want to delete player ${playerId}? This cannot be undone.`,
        async () => { // onConfirm
            const playerData = await loadPlayerData();

            if (!playerData[playerId]) {
                console.warn(`[Delete Player] Player with ID ${playerId} not found.`);
                ModalManager.showNotification('Error', "Player not found.", 500);
                if (callback) callback(false, null, "Player not found.");
                return;
            }

            const deletedPlayerName = playerData[playerId].name || playerId;
            delete playerData[playerId]; // Delete the player data

            await savePlayerData(playerData);

            ModalManager.showNotification('Success', `Player ${deletedPlayerName} deleted.`, 500);
            if (callback) callback(true, playerId, "Player deleted."); 
        },
        () => { // onCancel
            ModalManager.showNotification('Cancelled', 'Delete operation cancelled.', 500);
            if (callback) callback(false, null, "Delete operation cancelled.");
        }
    );
}

/**
 * Handles the process of refreshing a player's username from the API.
 * @param {string} playerId - The ID of the player whose name to refresh.
 * @param {HTMLElement} buttonElement - The refresh button element for UI feedback.
 * @param {Function} refreshListCallback - Callback to refresh the user list display.
 */
async function handleRefreshUserName(playerId, buttonElement, refreshListCallback) {
    buttonElement.disabled = true;
    buttonElement.innerHTML = '&#x21bb;'; // Loading/hourglass emoji

    try {
        const authToken = await new Promise((resolve, reject) => {
            chrome.storage.local.get('authToken', (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result.authToken);
            });
        });

        if (!authToken) {
            ModalManager.showAlert('Error', 'Authentication token not found. Please ensure you are logged in to botc.app.');
            throw new Error('Auth token not found');
        }

        const response = await fetch(`https://botc.app/backend/user/${playerId}`, {
            headers: { 'Authorization': authToken }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            ModalManager.showAlert('Error', `Error fetching user data: ${errorData.message || response.statusText}`);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const newUsername = data && data.user ? data.user.username : null;

        if (newUsername) {
            const playerData = await loadPlayerData();

            const player = playerData[playerId];
            if (player && player.name !== newUsername) {
                const oldUsername = player.name;
                player.name = newUsername;
                updateUsernameHistory(player, oldUsername); // Ensure this function is defined and works
                await savePlayerData(playerData);
                ModalManager.showAlert('Success', `Player ${playerId}'s name updated from "${oldUsername}" to "${newUsername}".`);
                if (refreshListCallback) refreshListCallback();
            } else if (player && player.name === newUsername) {
                ModalManager.showAlert('Success', `Player ${playerId}'s name "${newUsername}" is already up-to-date.`);
            } else {
                ModalManager.showAlert('Error', `Player ${playerId} not found in local data. This shouldn't happen.`);
            }
        } else {
            ModalManager.showAlert('Error', `Could not retrieve a valid username for player ${playerId}.`);
        }
    } catch (error) {
        console.error('Error refreshing username:', error);
        // ModalManager.showAlert('Error', 'Failed to refresh username. See console for details.'); // Already alerted specific errors
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerHTML = '&#x21bb;'; // Reset to refresh icon
    }
}

/**
 * Updates the username history for a player if the new username is different.
 * This function is adapted from background.js and should be available in userManager.js context.
 * @param {Object} playerObject - The player object from playerData.
 * @param {string} oldUsername - The username before the update.
 */
function updateUsernameHistory(playerObject, oldUsername) {
    if (!playerObject) return false;

    const newUsername = playerObject.name; // Assumes playerObject.name has been updated to the new name

    if (oldUsername && newUsername && oldUsername.toLowerCase() !== newUsername.toLowerCase()) {
        if (!playerObject.usernameHistory) {
            playerObject.usernameHistory = [];
        }

        // Check if the old username is already the most recent entry (to avoid duplicates if rapidly changed)
        const lastHistoryEntry = playerObject.usernameHistory.length > 0 ? playerObject.usernameHistory[0].username : null;
        
        // Add the *previous* name to history only if it's not already the latest entry
        if (!lastHistoryEntry || lastHistoryEntry.toLowerCase() !== oldUsername.toLowerCase()) {
            playerObject.usernameHistory.unshift({ username: oldUsername, timestamp: Date.now() });
            // console.log(`[Username History] Added '${oldUsername}' to history for player ${playerObject.id}. New name: '${newUsername}'.`);
            return true; // Indicates history was updated
        }
    }
    return false; // No update to history needed
}

/**
 * Function to allow editing of player details or adding a new player
 * @param {string|null} playerId - The ID of the player to edit, null for new player
 * @param {boolean} isNewPlayer - Whether this is a new player being added
 * @param {Function} callback - Optional callback after player is saved
 */
async function editPlayerDetails(playerId, isNewPlayer = false, callback) {
    const playerData = await loadPlayerData();
    let player = null;
    let modalTitle = 'Add New Player';
    let playerDataForForm = { name: '', score: null, notes: '' };

    // If editing an existing player
    if (playerId && !isNewPlayer) {
        player = playerData[playerId];
        if (!player) {
            ModalManager.showAlert('Error', 'Player not found.');
            return;
        }
        modalTitle = `Edit Player: ${player.name || `ID: ${playerId}`}`;
        playerDataForForm = playerData[playerId]; // Get existing data
    }

    // Create modal body content using DOM manipulation
    const modalBodyContent = document.createElement('div');
    modalBodyContent.classList.add('modal-edit-player-form');

    // Player ID (for Add New)
    const idDiv = document.createElement('div');
    const idLabel = document.createElement('label');
    idLabel.htmlFor = 'modalEditPlayerId';
    idLabel.textContent = 'Player ID:';
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.id = 'modalEditPlayerId';
    idInput.required = true;
    idInput.value = playerId || '';
    idInput.disabled = !isNewPlayer; // Only enable editing for new players
    idDiv.appendChild(idLabel);
    idDiv.appendChild(idInput);
    modalBodyContent.appendChild(idDiv);
    
    // Add ID format helper text for new players
    if (isNewPlayer) {
        const idHelperText = document.createElement('small');
        idHelperText.textContent = 'Enter a 10+ digit numerical ID (from botc.app)';
        idHelperText.style.display = 'block';
        idHelperText.style.marginTop = '2px';
        idHelperText.style.fontSize = '0.8em';
        idHelperText.style.color = 'var(--text-muted)';
        idDiv.appendChild(idHelperText);
    }

    // Player Name
    const nameDiv = document.createElement('div');
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'modalEditPlayerName';
    nameLabel.textContent = 'Player Name:';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'modalEditPlayerName';
    nameInput.value = playerDataForForm.name || '';
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(nameInput);
    modalBodyContent.appendChild(nameDiv);

    // Score
    const scoreDiv = document.createElement('div');
    const scoreLabel = document.createElement('label');
    scoreLabel.htmlFor = 'modalEditPlayerScore';
    scoreLabel.textContent = 'Score (1-5, optional):';
    const scoreInput = document.createElement('input');
    scoreInput.type = 'number';
    scoreInput.id = 'modalEditPlayerScore';
    scoreInput.value = playerDataForForm.score === null || playerDataForForm.score === undefined ? '' : playerDataForForm.score;
    scoreInput.min = '1';
    scoreInput.max = '5';
    scoreDiv.appendChild(scoreLabel);
    scoreDiv.appendChild(scoreInput);
    modalBodyContent.appendChild(scoreDiv);

    // Notes
    const notesDiv = document.createElement('div');
    const notesLabel = document.createElement('label');
    notesLabel.htmlFor = 'modalEditPlayerNotes';
    notesLabel.textContent = 'Notes (optional):';
    const notesTextarea = document.createElement('textarea');
    notesTextarea.id = 'modalEditPlayerNotes';
    notesTextarea.rows = 3;
    notesTextarea.textContent = playerDataForForm.notes || ''; // Use textContent for textarea
    notesDiv.appendChild(notesLabel);
    notesDiv.appendChild(notesTextarea);
    modalBodyContent.appendChild(notesDiv);

    // Define button configuration
    const buttonsConfig = [
        {
            text: 'Cancel',
            className: 'modal-button-secondary',
            callback: () => ModalManager.closeModal(), // Simple close on cancel
            closesModal: true
        },
        {
            text: 'Save Changes',
            className: 'modal-button-primary',
            callback: async () => {
                const newId = document.getElementById('modalEditPlayerId').value.trim();
                const newName = document.getElementById('modalEditPlayerName').value.trim();
                const newScoreStr = document.getElementById('modalEditPlayerScore').value.trim();
                const newNotes = document.getElementById('modalEditPlayerNotes').value.trim();
                
                // Validate new player ID if this is a new player
                if (isNewPlayer) {
                    if (!newId) {
                        ModalManager.showAlert('Invalid Input', 'Player ID is required.');
                        return; // Keep modal open for correction
                    }
                    
                    // Validate that ID is numerical and long enough to be a BotC ID
                    if (!/^\d{10,}$/.test(newId)) {
                        ModalManager.showAlert('Invalid Input', 'Player ID must be a numerical value of at least 10 digits.');
                        return; // Keep modal open for correction
                    }
                    
                    // Check if player ID already exists
                    if (playerData[newId]) {
                        ModalManager.showAlert('Player Exists', 'A player with this ID already exists. Please edit that player instead.');
                        return; // Keep modal open for correction
                    }
                }

                let newScore = null;
                if (newScoreStr) {
                    const parsedScore = parseInt(newScoreStr, 10);
                    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
                        ModalManager.showAlert('Invalid Input', 'Invalid score. Must be a number between 1 and 5. Score will not be changed unless corrected.');
                        return; // Keep modal open for correction
                    } else {
                        newScore = parsedScore;
                    }
                }

                try {
                    // Define the UI update callback for after player data is saved
                    const uiUpdateCallback = (updatedPlayer) => {
                        if (updatedPlayer) {
                            if (isNewPlayer) {
                                ModalManager.showAlert('Success', `Player ${updatedPlayer.name || updatedPlayer.id} added successfully!`);
                            } else {
                                ModalManager.showAlert('Success', `Player ${updatedPlayer.name || updatedPlayer.id} details updated.`);
                            }
                            
                            // Call the provided callback function if it exists
                            if (typeof callback === 'function') {
                                callback(updatedPlayer);
                            } else if (typeof window.renderKnownPlayers === 'function') {
                                window.renderKnownPlayers(); // Refresh the list
                            } else if (typeof renderKnownPlayers === 'function') {
                                renderKnownPlayers(); // If called from within userManager.js context
                            }
                            
                            ModalManager.closeModal();
                        }
                    };

                    // Use the appropriate player ID based on whether we're adding or editing
                    const finalPlayerId = isNewPlayer ? newId : playerId;
                    
                    // If adding a new player, don't carry over any favorite status
                    const existingFavoriteStatus = isNewPlayer ? false : (playerData[playerId]?.isFavorite || false);
                    
                    // Call addPlayer (which handles both creation and updates)
                    await addPlayer(finalPlayerId, newName || `Player ${finalPlayerId}`, newScore, newNotes, existingFavoriteStatus, uiUpdateCallback);

                } catch (error) {
                    console.error(`Failed to update player:`, error);
                    ModalManager.showAlert('Error', `Failed to update player: ${error.message}`);
                }
            },
            closesModal: false // Handle close explicitly in callback after save/error
        }
    ];

    // Call ModalManager with the created DOM element and button config
    ModalManager.showModal(modalTitle, modalBodyContent, buttonsConfig);
}



/**
 * Render the known players list, optionally filtering by search term.
 * @param {HTMLElement} container - The container element to render into.
 * @param {string} [searchTerm=''] - Optional search term to filter players.
 */
async function renderKnownPlayers(container, searchTerm = '') {
    console.log('[renderKnownPlayers] called. SessionData:', window.latestSessionData);
    if (!container) {
        console.error("Container element not provided for rendering known players.");
        return;
    }
    if (!window.latestSessionData) {
        console.warn('[renderKnownPlayers] Not rendering: session data not available.');
        return;
    }
    // Load the latest player data directly from storage each time
    const playerData = await loadPlayerData();
    // Fetch the latest set of online player IDs
    let onlinePlayerIds = new Set();
    try {
        // Always use window.fetchOnlinePlayerIds for consistency
        if (typeof window.fetchOnlinePlayerIds === 'function') {
            console.log('[renderKnownPlayers] window.fetchOnlinePlayerIds:', window.fetchOnlinePlayerIds);
            console.log('[renderKnownPlayers] calling fetchOnlinePlayerIds...');
            onlinePlayerIds = await window.fetchOnlinePlayerIds();
        } else {
            console.warn("window.fetchOnlinePlayerIds function not found.");
        }
    } catch (error) {
        console.error("Error fetching online player IDs in renderKnownPlayers:", error);
    }

    // Use the existing display function, passing the loaded data and necessary callbacks
    // Pass the onlinePlayerIds Set instead of sessionData
    await displayKnownPlayers(container, searchTerm, playerData, onlinePlayerIds, createUsernameHistoryModal, () => renderKnownPlayers(container, searchTerm));
}

/**
 * Fetches and updates a player's name from the API.
 * @param {string} playerId - The ID of the player to update.
 * @param {Function} [refreshListCallback] - Optional callback to refresh the list after updating.
 */
async function fetchAndUpdatePlayerName(playerId, refreshListCallback) {
    if (!playerId) return;

    try {
        // Use the authToken from storage, similar to handleRefreshUserName
        const authToken = await new Promise((resolve, reject) => {
            chrome.storage.local.get('authToken', (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result.authToken);
            });
        });

        if (!authToken) {
            ModalManager.showAlert('Error', 'Authentication token not found for API call. Please log in.');
            throw new Error('Auth token not found for API call');
        }

        const response = await fetch(`https://botc.app/backend/user/${playerId}`, {
            headers: { 'Authorization': authToken }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`API request failed: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();

        const newUsername = data && data.user ? data.user.username : null;

        if (newUsername) {
            const currentPlayerData = await loadPlayerData(); // Load current data

            const player = currentPlayerData[playerId];
            if (player) {
                const oldUsername = player.name;
                if (player.name !== newUsername) {
                    player.name = newUsername;
                    // Update username history internally before saving through addPlayer
                    // This logic is now encapsulated within addPlayer if name changes
                    // For standalone name updates, ensure history is managed here or within addPlayer
                    updateUsernameHistory(player, oldUsername); // Pass the player object and old name
                    
                    // Use addPlayer to ensure all fields are handled correctly and consistently
                    // This will also trigger savePlayerData internally
                    addPlayer(playerId, newUsername, player.score, player.notes, player.isFavorite, (updatedPlayer) => {
                        ModalManager.showAlert('Success', `Player ${playerId}'s name updated from "${oldUsername}" to "${newUsername}".`);
                        if (refreshListCallback) refreshListCallback();
                    });
                } else {
                    ModalManager.showAlert('Info', `Player ${playerId}'s name "${newUsername}" is already up-to-date.`);
                }
            } else {
                 ModalManager.showAlert('Notice', `Player ${playerId} not found in local data. You may add them if desired.`);
                // Optionally trigger add player flow here if it's desired behavior
            }
        } else {
            ModalManager.showAlert('Warning', `Could not retrieve a valid username for player ${playerId} from API.`);
        }
    } catch (error) {
        console.error(`Error fetching or updating player ${playerId} name:`, error);
        ModalManager.showAlert('Error', `Failed to fetch/update player name: ${error.message}`);
    }
}

// Expose functions to the window object for use by other modules
window.userManager = {
    loadPlayerData, // Primarily for internal use or specific scenarios
    savePlayerData, // For direct save if needed, though addPlayer handles its own saves
    getAllPlayerData, // Preferred method for external modules to get a safe copy of data
    addPlayer,
    replaceAllPlayerDataAndSave,
    updateUsernameHistoryIfNeeded,
    updateSessionHistoryIfNeeded,
    getRatingClass, // Already on window, but good for namespacing
    deletePlayer,
    toggleFavoriteStatus,
    editPlayerDetails,
    handleRefreshUserName,
    fetchAndUpdatePlayerName,
    renderKnownPlayers, // To allow popup.js to trigger re-renders of the user management tab
    createUsernameHistoryModal, // Expose for sessionManager
    getOnlinePlayerIds // Add this function for online player detection
};

// Make getRatingClass globally available as other modules might use it directly
// and it's a pure utility function.
if (typeof window.getRatingClass === 'undefined') {
    window.getRatingClass = getRatingClass;
}
