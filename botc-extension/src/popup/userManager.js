/**
 * User Manager Module
 * Handles all user-related functionality including:
 * - Storing and retrieving user data
 * - Username history tracking
 * - User interface for managing players
 */

// Store reference to player data
let allPlayerData = {};

/**
 * Load player data from Chrome storage
 * @param {Function} callback - Function to call with loaded data
 */
function loadPlayerData(callback) {
    chrome.storage.local.get('playerData', (data) => {
        allPlayerData = data.playerData || {};
        callback(allPlayerData);
    });
}

/**
 * Save player data to Chrome storage
 * @param {Object} playerData - Player data to save
 * @param {Function} callback - Function to call after saving
 */
function savePlayerData(playerData, callback) {
    allPlayerData = playerData;
    chrome.storage.local.set({ playerData }, callback);
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
 * Displays known players in the specified container, filtered by search term and indicating online status.
 * @param {HTMLElement} container - The container element to display players in.
 * @param {string} [searchTerm=''] - Optional search term to filter players.
 * @param {Object} playerData - The player data object.
 * @param {Array|null} [sessionData=null] - Optional array of active sessions to determine online status.
 * @param {Function} createUsernameHistoryModalFunc - Function to create the history modal.
 * @param {Function} refreshCallback - Callback to refresh the list after edits or favorite changes.
 */
function displayKnownPlayers(container, searchTerm = '', playerData, sessionData = null, createUsernameHistoryModalFunc, refreshCallback) {
    container.innerHTML = ''; // Clear previous results

    // Determine online players
    const onlinePlayerIds = new Set();
    if (sessionData && Array.isArray(sessionData)) { // Check if sessionData is an array of sessions
        sessionData.forEach(session => {
            if (session && session.usersAll && Array.isArray(session.usersAll)) {
                session.usersAll.forEach(user => { // Changed from 'player' to 'user' for clarity
                    if (user && user.id) onlinePlayerIds.add(user.id.toString());
                });
            }
        });
    } else if (sessionData instanceof Set) { // Check if sessionData is already a Set of IDs (from refreshUserManagementTab)
        sessionData.forEach(id => onlinePlayerIds.add(id.toString()));
    }

    const lowerSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';

    const filteredPlayersArray = Object.entries(playerData)
        .filter(([id, player]) => {
            if (lowerSearchTerm === '') {
                return true; // Show all if no search term
            }
            // Check for matches in player name, notes, score, or ID
            const nameMatch = player.name && player.name.toLowerCase().includes(lowerSearchTerm);
            const notesMatch = player.notes && player.notes.toLowerCase().includes(lowerSearchTerm);
            const scoreMatch = player.score !== undefined && player.score.toString().toLowerCase().includes(lowerSearchTerm);
            const idMatch = id.toLowerCase().includes(lowerSearchTerm); // Search by Player ID

            return nameMatch || notesMatch || scoreMatch || idMatch;
        })
        .map(([id, player]) => ({ ...player, id, isOnline: onlinePlayerIds.has(id) })); // Add id and online status

    // Sort players: online first, then by name
    const sortedPlayerIds = filteredPlayersArray.sort((a, b) => {
        const isOnlineA = a.isOnline;
        const isOnlineB = b.isOnline;

        // Sort logic: Online players first, then alphabetically by name
        if (isOnlineA && !isOnlineB) return -1; // Online A comes before offline B
        if (!isOnlineA && isOnlineB) return 1;  // Offline A comes after online B
        
        // If both are online or both are offline, sort by name
        return (a.name || '').localeCompare(b.name || '');
    });

    sortedPlayerIds.forEach(player => {
        const card = document.createElement('div');
        card.className = `player-card known-player ${getRatingClass(player.score || 3)}`; // Add known-player class
        if (player.isOnline) {
            card.classList.add('online');
        }
        if (player.isFavorite) {
            card.classList.add('favorite-player');
        }

        // --- Player Info Container ---
        const infoContainer = document.createElement('div');
        infoContainer.className = 'player-info-container';

        const nameElement = document.createElement('strong');
        nameElement.textContent = player.name || 'Unknown Name';
        infoContainer.appendChild(nameElement);

        const idElement = document.createElement('small');
        idElement.textContent = ` (ID: ${player.id})`;
        idElement.style.color = 'var(--subtle-text-color)';
        infoContainer.appendChild(idElement);

        if (player.isOnline) {
            let sessionName = null;
            if (sessionData && Array.isArray(sessionData)) { 
                for (const session of sessionData) {
                    if (session && session.name && Array.isArray(session.usersAll)) {
                        const userInSession = session.usersAll.some(user => {
                            const isMatch = user && String(user.id) === player.id;
                            return isMatch;
                        });
                        if (userInSession) {
                            sessionName = session.name;
                            break; // Found the session for this player
                        }
                    }
                }
            }

            // Create and add the online badge
            const onlineBadge = document.createElement('span');
            onlineBadge.classList.add('online-badge');
            onlineBadge.title = 'Online';
            infoContainer.appendChild(onlineBadge);

            // Create and add the session name indicator if found
            if (sessionName) {
                const sessionNameSpan = document.createElement('span');
                sessionNameSpan.classList.add('session-name-indicator');
                sessionNameSpan.textContent = ` (in: ${sessionName})`;
                infoContainer.appendChild(sessionNameSpan);
            }
        } else if (player.lastSeenTimestamp) { // Player is offline, show last seen time
            const lastSeenText = formatTimeSince(player.lastSeenTimestamp);
            const lastSeenElement = document.createElement('small');
            lastSeenElement.textContent = ` (Last seen: ${lastSeenText})`;
            lastSeenElement.style.color = 'var(--subtle-text-color)';
            lastSeenElement.style.fontStyle = 'italic';
            infoContainer.appendChild(lastSeenElement);
        }

        infoContainer.appendChild(document.createElement('br')); // Line break

        const scoreElement = document.createElement('span');
        scoreElement.textContent = `Score: ${player.score !== undefined ? player.score : 'N/A'}/5`;
        infoContainer.appendChild(scoreElement);

        if (player.notes) {
            const notesElement = document.createElement('p');
            notesElement.textContent = `Notes: ${player.notes}`;
            notesElement.className = 'player-notes';
            infoContainer.appendChild(notesElement);
        }

        if (player.lastSeenSessionId) {
            const sessionInfo = document.createElement('small');
            sessionInfo.textContent = ` | Sessions: ${player.uniqueSessionCount || 1}`; // Show count
            sessionInfo.style.marginLeft = '10px';
            infoContainer.appendChild(sessionInfo);
        }

        card.appendChild(infoContainer); // Add info part to card

        // --- Button Container ---
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'player-card-buttons';

        // Edit Button
        const editButton = document.createElement('button');
        editButton.textContent = '📝'; // Use icon for compactness
        editButton.className = 'edit-player-button player-card-button'; // Consistent class
        editButton.title = 'Edit Player Details';
        // Enable the button and add the click handler
        editButton.onclick = (e) => {
            e.stopPropagation();
            // Prompt for updated details, pre-filling with existing data
            const newName = prompt(`Enter new name for ${player.name} (ID: ${player.id}):`, player.name);
            if (newName === null) return; // User cancelled name prompt

            const newScoreStr = prompt(`Enter new score (1-5) for ${newName || player.name}:`, player.score !== undefined ? player.score : '3');
            if (newScoreStr === null) return; // User cancelled score prompt

            let newScore = parseInt(newScoreStr, 10);
            if (isNaN(newScore) || newScore < 1 || newScore > 5) {
                alert("Invalid score. Please enter a number between 1 and 5. Keeping original score.");
                newScore = player.score; // Keep original score if input is invalid
            }

            const newNotes = prompt(`Enter new notes for ${newName || player.name}:`, player.notes || '');
            if (newNotes === null) return; // User cancelled notes prompt

            // Call the core addPlayer function (handles both add and update)
            if (typeof window.addPlayer === 'function') {
                window.addPlayer(player.id, newName, newScore, newNotes, player.isFavorite, (success, message) => {
                    if (success) {
                        console.log(`Player ${player.id} updated via prompt.`);
                        if (typeof refreshCallback === 'function') {
                            refreshCallback(); // Refresh the list
                        }
                    } else {
                        alert(`Failed to update player: ${message}`);
                        console.error(`Failed to update player ${player.id}: ${message}`);
                    }
                });
            } else {
                console.error('window.addPlayer function not found!');
                alert('Update feature is unavailable.');
            }
        };
        buttonContainer.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️'; // Trash can emoji for delete
        deleteButton.title = 'Delete Player';
        deleteButton.className = 'player-action-button delete-button'; // Add specific class if needed for styling
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent card click
            if (confirm(`Are you sure you want to delete player ${player.name} (${player.id})? This cannot be undone.`)) {
                // Use the globally exposed deletePlayer function
                window.deletePlayer(player.id, (success, deletedPlayerId, message) => {
                    if (success) {
                        console.log(`Player ${deletedPlayerId} deleted via button.`);
                        if (card && card.parentNode) {
                            card.remove(); // Use the 'card' variable from the outer scope
                            console.log(`Removed card for player ${deletedPlayerId} from UI.`);
                        } else {
                            console.warn(`Card element reference or parentNode was missing for player ${deletedPlayerId}. Could not remove directly.`);
                            // Optionally fall back to full refresh if direct removal fails
                            // if (typeof refreshCallback === 'function') refreshCallback(); 
                        }
                    } else {
                        alert(`Failed to delete player: ${message}`);
                        console.error(`Failed to delete player ${player.id}: ${message}`);
                    }
                });
            }
        };
        buttonContainer.appendChild(deleteButton);

        // Username History Button (only if history exists)
        if (player.usernameHistory && player.usernameHistory.length > 0) {
            const historyButton = document.createElement('button');
            historyButton.textContent = 'History';
            historyButton.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering card click/other events
                createUsernameHistoryModalFunc(player.usernameHistory, player.name);
            };
            buttonContainer.appendChild(historyButton);
        }

        // Favorite Button
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-button player-card-button';
        // --- Set initial state based on player.isFavorite ---
        favoriteButton.textContent = player.isFavorite ? '★' : '☆'; // Set star based on saved status
        favoriteButton.title = player.isFavorite ? 'Remove from favorites' : 'Add to favorites'; // Set title
        
        favoriteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering card click/other events
            toggleFavoriteStatus(player.id, favoriteButton); // Use the toggle function
        };
        buttonContainer.appendChild(favoriteButton);

        // Refresh Name Button
        const refreshNameButton = document.createElement('button');
        refreshNameButton.innerHTML = '🔄'; // Refresh icon
        refreshNameButton.title = 'Refresh Player Name';
        refreshNameButton.classList.add('refresh-name-btn'); // For styling or specific selection
        refreshNameButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRefreshUserName(player.id, refreshNameButton, refreshCallback);
        });
        buttonContainer.appendChild(refreshNameButton);

        card.appendChild(buttonContainer); // Add button container to card

        container.appendChild(card);
    });

    if (container.children.length === 0 && !searchTerm) {
        container.textContent = 'No players saved yet. Players you interact with in sessions will appear here.';
    } else if (container.children.length === 0 && searchTerm) {
        container.textContent = 'No players found matching your search.';
    }
}

/**
 * Add or update a player in the data
 * @param {string} id - Player ID
 * @param {string} name - Player name
 * @param {number} score - Player rating
 * @param {string} notes - Player notes
 * @param {Function} [updateUICallback] - Optional callback to execute after saving, receives updated player data
 */
function addPlayer(id, name, score, notes, isFavorite, updateUICallback) {
    // Validate score input
    const parsedScore = parseInt(score, 10);
    const finalScore = !isNaN(parsedScore) && parsedScore >= -5 && parsedScore <= 5 ? parsedScore : null;

    loadPlayerData((playerData) => {
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
            console.log(`Updating name for ${id}: "${playerData[id].name}" -> "${name}"`);
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

        savePlayerData(playerData, () => {
            console.log('Player data saved:', playerData);
            // Pass the updated data for this specific player to the callback
            if (updateUICallback && typeof updateUICallback === 'function') {
                // Ensure the callback receives the full updated player data, including isFavorite
                updateUICallback(playerData[id]);
            }
        });
    });
}

/**
 * Checks if a player's username from a session differs from the stored one.
 * If it differs, updates the username and history in storage.
 * @param {string} userId - The ID of the player.
 * @param {string} sessionUsername - The username found in the current session data.
 * @param {Object} currentPlayerData - The currently loaded player data object.
 * @param {Function} callback - Callback function, receives (wasUpdated: boolean, updatedPlayerData: Object).
 */
function updateUsernameHistoryIfNeeded(userId, sessionUsername, currentPlayerData, callback) {
    const player = currentPlayerData[userId];
    let updatedData = { ...currentPlayerData }; // Work on a copy
    let needsSave = false;

    // If player isn't known at all, we can't update history (should be added first)
    if (!player) {
        callback(false, currentPlayerData); 
        return;
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
            // Trim history if it exceeds max length (e.g., 10 entries)
            if (history.length > 10) {
                 history.shift(); // Remove the oldest entry
            }
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
        updatedData[userId] = player; // Put the modified player back into the copied data
        // Save the entire updated player data object
        savePlayerData(updatedData, () => {
            callback(true, updatedData); // Update occurred
        });
    } else {
        callback(false, currentPlayerData);
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
function updateSessionHistoryIfNeeded(userId, currentSessionId, currentPlayerData, callback) {
    if (!userId || !currentSessionId) {
        if (callback) callback(false, currentPlayerData); // No change
        return;
    }

    let player = currentPlayerData[userId];
    if (!player) {
        if (callback) callback(false, currentPlayerData); // No change, player not found
        return;
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
        savePlayerData({ ...currentPlayerData, [userId]: player }, () => {
            if (callback) callback(true, { ...currentPlayerData, [userId]: player });
        });
    } else {
        if (callback) callback(false, currentPlayerData);
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
function replaceAllPlayerDataAndSave(newData, callback) {
    allPlayerData = newData; // Replace in-memory store
    savePlayerData(allPlayerData, () => { // Save to Chrome storage
        if (callback) callback();
    });
}

// -- START: Initialization & Utility --

/**
 * Toggles the favorite status of a player and updates storage and UI.
 * @param {string} playerId - The ID of the player.
 * @param {HTMLElement} buttonElement - The button element to update.
 */
function toggleFavoriteStatus(playerId, buttonElement) {
    loadPlayerData(playerData => {
        if (playerData[playerId]) {
            playerData[playerId].isFavorite = !playerData[playerId].isFavorite; // Toggle status

            savePlayerData(playerData, () => {
                console.log(`Player ${playerId} favorite status set to ${playerData[playerId].isFavorite}`);
                // Update button appearance immediately
                buttonElement.textContent = playerData[playerId].isFavorite ? '★' : '☆';
                buttonElement.title = playerData[playerId].isFavorite ? 'Remove from favorites' : 'Add to favorites';
            });
        } else {
            console.error(`Player ${playerId} not found for favorite toggle.`);
        }
    });
}

/**
 * Deletes a player from the stored data.
 * @param {string} playerId - The ID of the player to delete.
 * @param {Function} callback - Function to call after deletion attempt (receives success: boolean, deletedPlayerId: string|null, message: string).
 */
function deletePlayer(playerId, callback) {
    loadPlayerData(playerData => {
        if (!playerData[playerId]) {
            console.warn(`[Delete Player] Player with ID ${playerId} not found.`);
            if (callback) callback(false, null, "Player not found.");
            return;
        }

        // Delete the player data
        delete playerData[playerId];

        // Save the updated data
        savePlayerData(playerData, () => {
            console.log(`[Delete Player] Player ${playerId} deleted successfully.`);
            if (callback) callback(true, playerId, "Player deleted."); // Pass playerId back
        });
    });
}

window.loadPlayerData = loadPlayerData;
window.addPlayer = addPlayer;
window.displayKnownPlayers = displayKnownPlayers;
window.createUsernameHistoryModal = createUsernameHistoryModal;
window.savePlayerData = savePlayerData; 
window.toggleFavoriteStatus = toggleFavoriteStatus;
window.deletePlayer = deletePlayer;
window.getRatingClass = getRatingClass;
window.handleRefreshUserName = handleRefreshUserName; 
window.replaceAllPlayerDataAndSave = replaceAllPlayerDataAndSave; 

/**
 * Handles the process of refreshing a player's username from the API.
 * @param {string} playerId - The ID of the player whose name to refresh.
 * @param {HTMLElement} buttonElement - The refresh button element for UI feedback.
 * @param {Function} refreshListCallback - Callback to refresh the user list display.
 */
async function handleRefreshUserName(playerId, buttonElement, refreshListCallback) {
    buttonElement.disabled = true;
    buttonElement.innerHTML = '⏳'; // Loading/hourglass emoji

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
            alert('Authentication token not found. Please ensure you are logged in to botc.app.');
            throw new Error('Auth token not found');
        }

        const response = await fetch(`https://botc.app/backend/user/${playerId}`, {
            headers: { 'Authorization': authToken }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            alert(`Error fetching user data: ${errorData.message || response.statusText}`);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const newUsername = data && data.user ? data.user.username : null;

        if (newUsername) {
            loadPlayerData(playerData => {
                const player = playerData[playerId];
                if (player && player.name !== newUsername) {
                    const oldUsername = player.name;
                    player.name = newUsername;
                    updateUsernameHistory(player, oldUsername); // Ensure this function is defined and works
                    savePlayerData(playerData, () => {
                        alert(`Player ${playerId}'s name updated from "${oldUsername}" to "${newUsername}".`);
                        if (refreshListCallback) refreshListCallback();
                    });
                } else if (player && player.name === newUsername) {
                    alert(`Player ${playerId}'s name "${newUsername}" is already up-to-date.`);
                } else {
                    alert(`Player ${playerId} not found in local data. This shouldn't happen.`);
                }
            });
        } else {
            alert(`Could not retrieve a valid username for player ${playerId}.`);
        }
    } catch (error) {
        console.error('Error refreshing username:', error);
        // alert('Failed to refresh username. See console for details.'); // Already alerted specific errors
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerHTML = '🔄'; // Reset to refresh icon
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
            console.log(`[Username History] Added '${oldUsername}' to history for player ${playerObject.id}. New name: '${newUsername}'.`);
            return true; // Indicates history was updated
        }
    }
    return false; // No update to history needed
}
