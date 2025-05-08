/**
 * User Manager Module
 * Handles all user-related functionality including:
 * - Storing and retrieving user data
 * - Username history tracking
 * - User search functionality
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
 * Update username history for a player
 * @param {string} id - Player ID
 * @param {string} username - Current username
 * @param {Object} playerData - Current player data
 * @returns {Object} Updated player data
 */
function updateUsernameHistory(id, username, playerData) {
    if (!playerData[id]) {
        playerData[id] = {
            name: username,
            usernameHistory: []
        };
        return playerData;
    }

    // Don't update if the name hasn't changed
    if (playerData[id].name === username) {
        return playerData;
    }

    // Check if this name is already in history
    const existingEntryIndex = (playerData[id].usernameHistory || []).findIndex(
        entry => entry.name === username
    );

    if (existingEntryIndex >= 0) {
        // Remove the existing entry so we can move it to the front
        playerData[id].usernameHistory.splice(existingEntryIndex, 1);
    }

    // Add the current name to history
    if (!playerData[id].usernameHistory) {
        playerData[id].usernameHistory = [];
    }

    // Add the old name to history
    playerData[id].usernameHistory.unshift({
        name: playerData[id].name,
        timestamp: Date.now()
    });

    // Update to the new name
    playerData[id].name = username;

    return playerData;
}

/**
 * Create modal to display username history
 * @param {Array} history - Array of username history entries
 * @param {string} currentName - Current username
 */
function createUsernameHistoryModal(history, currentName) {
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
 * Search through player data
 * @param {string} query - Search query
 * @returns {Array} Array of search results
 */
function searchPlayers(query) {
    if (!query) return [];
    
    query = query.toLowerCase();
    const results = [];

    Object.entries(allPlayerData).forEach(([id, playerData]) => {
        const currentName = playerData.name.toLowerCase();
        if (currentName.includes(query)) {
            results.push({
                id,
                ...playerData
            });
            return;
        }

        // Check historical names
        const history = playerData.usernameHistory || [];
        for (const entry of history) {
            if (entry.name.toLowerCase().includes(query)) {
                results.push({
                    id,
                    ...playerData
                });
                return;
            }
        }
    });

    return results;
}

/**
 * Display search results
 * @param {Array} results - Search results to display
 * @param {HTMLElement} searchResults - Element to display results in
 */
function displaySearchResults(results, searchResults) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';

        const info = document.createElement('div');
        info.className = 'search-result-info';

        const name = document.createElement('div');
        name.className = 'search-result-name';
        name.textContent = result.name;
        info.appendChild(name);

        if (result.usernameHistory && result.usernameHistory.length > 0) {
            const aliases = document.createElement('div');
            aliases.className = 'search-result-aliases';
            const previousNames = result.usernameHistory.map(h => h.name);
            aliases.textContent = `Also known as: ${previousNames.join(', ')}`;
            info.appendChild(aliases);
        }

        const rating = document.createElement('div');
        rating.className = `search-result-rating rating-${result.score || 'unknown'}`;
        rating.textContent = result.score ? `Rating: ${result.score}` : 'Unrated';
        info.appendChild(rating);

        item.appendChild(info);

        // View history button
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View History';
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            createUsernameHistoryModal(result.usernameHistory, result.name);
        });

        item.appendChild(viewButton);
        searchResults.appendChild(item);
    });

    searchResults.style.display = 'block';
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
    if (sessionData) {
        sessionData.forEach(session => {
            if (session && Array.isArray(session.usersAll)) {
                session.usersAll.forEach(user => {
                    if (user && user.id) {
                        onlinePlayerIds.add(String(user.id)); // Ensure string ID
                    }
                });
            }
        });
    }

    const sortedPlayerIds = Object.keys(playerData).sort((a, b) => {
        const playerA = playerData[a];
        const playerB = playerData[b];
        const isOnlineA = onlinePlayerIds.has(a);
        const isOnlineB = onlinePlayerIds.has(b);

        // Sort logic: Online players first, then alphabetically by name
        if (isOnlineA && !isOnlineB) return -1; // Online A comes before offline B
        if (!isOnlineA && isOnlineB) return 1;  // Offline A comes after online B
        
        // If both are online or both are offline, sort by name
        return (playerA.name || '').localeCompare(playerB.name || '');
    });

    sortedPlayerIds.forEach(id => {
        const player = playerData[id];
        const nameLower = (player.name || '').toLowerCase();
        const notesLower = (player.notes || '').toLowerCase();
        const isOnline = onlinePlayerIds.has(id);

        // Filter logic
        if (searchTerm && !nameLower.includes(searchTerm) && !notesLower.includes(searchTerm) && id !== searchTerm) {
            return; // Skip if search term doesn't match name, notes, or ID
        }

        const card = document.createElement('div');
        card.className = `player-card known-player ${getRatingClass(player.score || 3)}`; // Add known-player class
        if (isOnline) {
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
        idElement.textContent = ` (ID: ${id})`;
        idElement.style.color = 'var(--subtle-text-color)';
        infoContainer.appendChild(idElement);

        if (isOnline) {
            let sessionName = null;
            if (sessionData) {
                for (const session of sessionData) {
                    if (session && session.name && Array.isArray(session.usersAll)) {
                        const userInSession = session.usersAll.some(user => {
                            const isMatch = user && String(user.id) === id;
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
            const newName = prompt(`Enter new name for ${player.name} (ID: ${id}):`, player.name);
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
                window.addPlayer(id, newName, newScore, newNotes, player.isFavorite, (success, message) => {
                    if (success) {
                        console.log(`Player ${id} updated via prompt.`);
                        if (typeof refreshCallback === 'function') {
                            refreshCallback(); // Refresh the list
                        }
                    } else {
                        alert(`Failed to update player: ${message}`);
                        console.error(`Failed to update player ${id}: ${message}`);
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
            if (confirm(`Are you sure you want to delete player ${player.name} (${id})? This cannot be undone.`)) {
                // Use the globally exposed deletePlayer function
                window.deletePlayer(id, (success, deletedPlayerId, message) => {
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
                        console.error(`Failed to delete player ${id}: ${message}`);
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
            toggleFavoriteStatus(id, favoriteButton); // Use the toggle function
        };
        buttonContainer.appendChild(favoriteButton);

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
 * Toggle username history display
 * @param {string} playerId - Player ID
 * @param {HTMLElement} container - Container element
 */
function toggleUsernameHistory(playerId, container) {
    const existingHistory = container.querySelector('.username-history');
    if (existingHistory) {
        existingHistory.remove();
        return;
    }

    const playerData = allPlayerData[playerId];
    if (!playerData || !playerData.usernameHistory || playerData.usernameHistory.length === 0) {
        return;
    }

    const historyDiv = document.createElement('div');
    historyDiv.className = 'username-history';

    playerData.usernameHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'username-history-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'username-history-name';
        if (entry.oldName && entry.newName) {
            nameSpan.innerHTML = `<span class="old-name">${entry.oldName}</span> &rarr; <span class="new-name">${entry.newName}</span>`;
        } else {
            nameSpan.textContent = entry.name || entry.username || 'Unknown Change';
        }

        const dateSpan = document.createElement('span');
        dateSpan.className = 'username-history-date';
        dateSpan.textContent = formatTimestamp(entry.timestamp);

        historyItem.appendChild(nameSpan);
        historyItem.appendChild(dateSpan);
        historyDiv.appendChild(historyItem);
    });

    container.appendChild(historyDiv);
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
 * Helper function to get rating class
 * @param {number} score - Player rating
 * @returns {string} Rating class
 */
function getRatingClass(score) {
    if (score === null || score === undefined) {
        return 'rating-unknown';
    }
    return `rating-${score}`;
}

/**
 * Adds a new player manually using their ID.
 * @param {string} playerId - The unique ID of the player.
 * @param {string} initialName - The initial name to assign.
 * @param {string|number} initialScore - The initial score (validated later).
 * @param {string} initialNotes - The initial notes.
 * @param {function} [callback] - Optional callback after saving.
 */


// -- START: Import/Export --

/**
 * Helper function to escape CSV special characters (double quotes, commas, newlines).
 * If a field contains a comma, newline, or double quote, it should be enclosed in double quotes.
 * Existing double quotes within the field should be doubled.
 * @param {*} value The value to escape.
 * @returns {string} The escaped string suitable for CSV.
 */
function escapeCsvValue(value) {
    const strValue = String(value == null ? "" : value); // Handle null/undefined as empty string
    if (strValue.includes('"') || strValue.includes(',') || strValue.includes('\n')) {
        // Enclose in double quotes and double up existing double quotes
        return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
}

/**
 * Helper function to parse a single CSV row, handling quoted fields and escaped quotes.
 * @param {string} rowString The string for a single CSV row.
 * @returns {string[]} An array of strings, representing the values in the row.
 */
function parseCsvRow(rowString) {
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];

        if (char === '"') {
            if (inQuotes && i + 1 < rowString.length && rowString[i+1] === '"') {
                // Escaped double quote within a quoted field
                currentVal += '"';
                i++; // Skip the second quote of the pair
            } else {
                // Start or end of a quoted field
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Comma separator, and not inside a quoted field
            values.push(currentVal);
            currentVal = '';
        } else {
            // Regular character
            currentVal += char;
        }
    }
    values.push(currentVal); // Add the last value
    return values;
}

/**
 * Exports current player data to a CSV file.
 */
function exportPlayerDataCSV() {
    loadPlayerData(playerData => {
        if (!playerData || Object.keys(playerData).length === 0) {
            alert('No player data found to export.');
            return;
        }

        const headers = [
            'id', 'name', 'score', 'notes', 'isFavorite', 
            'lastSeenSessionId', 'lastSeenTimestamp', 'sessionHistory', 
            'uniqueSessionCount', 'usernameHistory'
        ];
        const csvRows = [headers.join(',')]; // Header row

        // Convert player data object to rows
        Object.keys(playerData).forEach(id => {
            const player = playerData[id];
            const row = [
                escapeCsvValue(id),
                escapeCsvValue(player.name || ''),
                escapeCsvValue(player.score ?? ''),
                escapeCsvValue(player.notes || ''),
                escapeCsvValue(player.isFavorite ? 'true' : 'false'),
                escapeCsvValue(player.lastSeenSessionId || ''),
                escapeCsvValue(player.lastSeenTimestamp || ''),
                escapeCsvValue(JSON.stringify(player.sessionHistory || [])),
                escapeCsvValue(player.uniqueSessionCount || 0),
                escapeCsvValue(JSON.stringify(player.usernameHistory || []))
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

        // Create a link and trigger the download
        const link = document.createElement('a');
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            // Suggest a filename
            const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            link.setAttribute('download', `player_data_export_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up
        } else {
            alert('CSV export is not supported in this browser.');
        }
    });
}

/**
 * Imports player data from a CSV file content, merging with existing data.
 * @param {string} csvContent - The content of the CSV file.
 * @param {Function} callback - Function to call after import attempt (receives success: boolean, message: string).
 * @param {Function} refreshDisplayFunc - Function to refresh the user list display.
 */
function importPlayerDataCSV(csvContent, callback, refreshDisplayFunc) {
    if (!csvContent) {
        callback(false, 'No file content provided.');
        return;
    }

    const lines = csvContent.split(/\r\n|\n/); // Split into lines
    if (lines.length < 2) {
        callback(false, 'CSV file must have a header row and at least one data row.');
        return;
    }

    const headers = parseCsvRow(lines[0]).map(h => h.trim().toLowerCase());
    const expectedBaseHeaders = ['id', 'name']; // Minimal required
    const allExpectedHeaders = [
        'id', 'name', 'score', 'notes', 'isfavorite', 
        'lastseensessionid', 'lastseentimestamp', 'sessionhistory', 
        'uniquesessioncount', 'usernamehistory'
    ]; // Note: all lowercase for easier matching

    if (!expectedBaseHeaders.every(h => headers.includes(h))) {
         callback(false, `CSV must contain at least '${expectedBaseHeaders.join(', ')}' columns.`);
         return;
    }
    
    // Find the index of each column we care about
    const colIndices = {};
    allExpectedHeaders.forEach(header => {
        colIndices[header.replace(/\s+/g, '')] = headers.indexOf(header);
    });

    loadPlayerData(existingPlayerData => {
        let updatedPlayerData = { ...existingPlayerData }; 
        let importedCount = 0;
        let skippedCount = 0; 
        let errorCount = 0;
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue; 

            // Parse the CSV row
            const values = parseCsvRow(line); 

            const id = colIndices.id !== -1 && values[colIndices.id] ? values[colIndices.id].trim() : null;
            const name = colIndices.name !== -1 && values[colIndices.name] ? values[colIndices.name].trim() : null;

            if (!id || !name) {
                console.warn(`[Import CSV] Skipping row ${i + 1}: Missing ID or Name.`);
                errors.push(`Row ${i + 1}: Missing ID or Name.`);
                errorCount++;
                continue;
            }

            if (updatedPlayerData[id]) {
                console.log(`[Import CSV] Skipping duplicate player ID ${id} ('${name}'). Data already exists.`);
                errors.push(`Row ${i + 1}: Skipped duplicate ID ${id} ('${name}')`);
                skippedCount++;
                continue; 
            }

            console.log(`[Import CSV] Adding new player ID ${id} ('${name}')`);

            const score = colIndices.score !== -1 && values[colIndices.score] ? values[colIndices.score].trim() : '';
            const notes = colIndices.notes !== -1 && values[colIndices.notes] ? values[colIndices.notes].trim() : '';
            const isFavoriteStr = colIndices.isfavorite !== -1 && values[colIndices.isfavorite] ? values[colIndices.isfavorite].trim().toLowerCase() : 'false';
            const isFavorite = isFavoriteStr === 'true';

            const lastSeenSessionId = colIndices.lastseensessionid !== -1 && values[colIndices.lastseensessionid] ? values[colIndices.lastseensessionid].trim() : null;
            const lastSeenTimestampStr = colIndices.lastseentimestamp !== -1 && values[colIndices.lastseentimestamp] ? values[colIndices.lastseentimestamp].trim() : null;
            const uniqueSessionCountStr = colIndices.uniquesessioncount !== -1 && values[colIndices.uniquesessioncount] ? values[colIndices.uniquesessioncount].trim() : '0';

            const newPlayer = {
                id,
                name,
                score: score ? parseInt(score, 10) : null,
                notes,
                isFavorite,
                lastSeenSessionId,
                lastSeenTimestamp: lastSeenTimestampStr ? parseInt(lastSeenTimestampStr, 10) : null,
                sessionHistory: [], // Default, to be parsed
                uniqueSessionCount: uniqueSessionCountStr ? parseInt(uniqueSessionCountStr, 10) : 0,
                usernameHistory: [{ timestamp: Date.now(), name: name }] // Default, to be parsed
            };

            // Parse sessionHistory
            if (colIndices.sessionhistory !== -1 && values[colIndices.sessionhistory]) {
                let sessionHistoryStr = values[colIndices.sessionhistory].trim();
                if (sessionHistoryStr.startsWith('"') && sessionHistoryStr.endsWith('"')) {
                    sessionHistoryStr = sessionHistoryStr.substring(1, sessionHistoryStr.length - 1).replace(/""/g, '"');
                }
                try {
                    newPlayer.sessionHistory = JSON.parse(sessionHistoryStr);
                } catch (e) {
                    console.warn(`[Import CSV] Row ${i + 1}, ID ${id}: Could not parse sessionHistory '${values[colIndices.sessionhistory]}'. Defaulting to empty. Error: ${e.message}`);
                    errors.push(`Row ${i + 1}, ID ${id}: Error parsing sessionHistory: ${e.message}`);
                    // newPlayer.sessionHistory remains [] as per default
                    errorCount++;
                }
            } else {
                 newPlayer.sessionHistory = []; // Ensure it's an array if column missing or empty
            }

            // Parse usernameHistory
            if (colIndices.usernamehistory !== -1 && values[colIndices.usernamehistory]) {
                let usernameHistoryStr = values[colIndices.usernamehistory].trim();
                if (usernameHistoryStr.startsWith('"') && usernameHistoryStr.endsWith('"')) {
                    usernameHistoryStr = usernameHistoryStr.substring(1, usernameHistoryStr.length - 1).replace(/""/g, '"');
                }
                try {
                    const parsedHistory = JSON.parse(usernameHistoryStr);
                    if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                        newPlayer.usernameHistory = parsedHistory;
                    } else {
                        // If parsed but empty or not an array, use default
                        console.warn(`[Import CSV] Row ${i + 1}, ID ${id}: usernameHistory was empty or invalid after parsing. Defaulting.`);
                         newPlayer.usernameHistory = [{ timestamp: Date.now(), name: name }];
                    }
                } catch (e) {
                    console.warn(`[Import CSV] Row ${i + 1}, ID ${id}: Could not parse usernameHistory '${values[colIndices.usernamehistory]}'. Defaulting. Error: ${e.message}`);
                    errors.push(`Row ${i + 1}, ID ${id}: Error parsing usernameHistory: ${e.message}`);
                    // newPlayer.usernameHistory remains default as set above
                    errorCount++;
                }
            } else {
                // Ensure it's a default array if column missing or empty
                newPlayer.usernameHistory = [{ timestamp: Date.now(), name: name }];
            }


            updatedPlayerData[id] = newPlayer;
            importedCount++;
        }

        savePlayerData(updatedPlayerData, () => {
            let message = `Import complete. Added: ${importedCount}, Skipped (Duplicates): ${skippedCount}.`;
            if (errorCount > 0) {
                 message += ` Other Errors: ${errorCount}. First few errors: ${errors.filter(e => !e.includes('Skipped duplicate')).slice(0,3).join('; ')}`;
            }
            console.log(`[Import CSV] ${message}`);
            callback(true, message);
            if (refreshDisplayFunc) {
                refreshDisplayFunc();
            }
        });
    });
}

// -- END: Import/Export --

// -- START: Initialization & Utility --

/**
 * Toggles the favorite status of a player and updates storage and UI.
 * @param {string} playerId - The ID of the player.
 * @param {HTMLElement} buttonElement - The button element to update.
 */
function toggleFavoriteStatus(playerId, buttonElement) {
    loadPlayerData(playerData => {
        if (playerData && playerData[playerId]) {
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
window.savePlayerData = savePlayerData; // Assuming save might be needed directly sometimes
window.exportPlayerDataCSV = exportPlayerDataCSV; // Expose export function
window.importPlayerDataCSV = importPlayerDataCSV; // Expose import function
window.toggleFavoriteStatus = toggleFavoriteStatus; // Ensure this is exposed
window.deletePlayer = deletePlayer; // Expose the delete function

// --- END: Initialization & Utility ---
