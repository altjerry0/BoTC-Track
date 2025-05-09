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
    if (sessionData && Array.isArray(sessionData)) { // If sessionData is an array of session objects
        sessionData.forEach(session => {
            if (session && session.usersAll && Array.isArray(session.usersAll)) {
                session.usersAll.forEach(user => {
                    if (user && user.id) onlinePlayerIds.add(user.id.toString());
                });
            }
        });
    } else if (sessionData instanceof Set) { // If sessionData is already a Set of IDs
        sessionData.forEach(id => onlinePlayerIds.add(id.toString()));
    }
    return onlinePlayerIds;
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
    const lowerSearchTerm = searchTerm ? searchTerm.toLowerCase() : ''; // Define lowerSearchTerm here
    container.innerHTML = ''; // Clear previous results

    // Determine online players
    const onlinePlayerIds = getOnlinePlayerIds(sessionData); // Ensure this call is correct

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
            if (sessionData && Array.isArray(sessionData)) { 
                for (const session of sessionData) {
                    if (session && session.name && Array.isArray(session.usersAll)) {
                        const userInSession = session.usersAll.some(user => {
                            const isMatch = user && String(user.id) === id.toString();
                            return isMatch;
                        });
                        if (userInSession) {
                            sessionName = session.name;
                            break; 
                        }
                    }
                }
            }

            const onlineBadge = document.createElement('span');
            onlineBadge.classList.add('online-badge');
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
            // Simplified prompt logic, adjust as per original detail if needed
            const newName = prompt(`Enter new name for ${player.name}:`, player.name);
            if (newName === null) return;

            const newScoreStr = prompt(`Enter new score (1-5) for ${newName}:`, player.score === null ? '' : player.score.toString());
            if (newScoreStr === null) return;
            let newScore = player.score; // Default to old score
            if (newScoreStr.trim() !== '') {
                const parsedScore = parseInt(newScoreStr, 10);
                if (!isNaN(parsedScore) && parsedScore >= 1 && parsedScore <= 5) {
                    newScore = parsedScore;
                } else if (newScoreStr.trim() === '') { // Allow clearing the score
                    newScore = null;
                } else {
                    alert("Invalid score. Must be 1-5 or empty. Score not changed.");
                }
            }

            const newNotes = prompt(`Enter new notes for ${newName}:`, player.notes === null ? '' : player.notes);
            if (newNotes === null) return;

            // Use existing addPlayer function for updates, preserving favorite status by passing player.isFavorite
            addPlayer(id, newName, newScore, newNotes, player.isFavorite, () => {
                console.log("Player updated, attempting to refresh list.");
                if (typeof refreshCallback === 'function') {
                    refreshCallback();
                }
            });
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
            if (confirm(`Are you sure you want to delete ${player.name}? This cannot be undone.`)) {
                deletePlayer(id, () => {
                    console.log("Player deleted, attempting to refresh list.");
                    if (typeof refreshCallback === 'function') {
                        refreshCallback();
                    }
                });
            }
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
             newIsFavoriteValue = true;
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
 * @param {Object} [playerObject] - Optional: The player object, to update its isFavorite status directly for immediate UI feedback.
 */
function toggleFavoriteStatus(playerId, buttonElement, playerObject) {
    loadPlayerData(playerData => {
        const player = playerData[playerId];
        if (player) {
            player.isFavorite = !player.isFavorite;
            if (playerObject) { // If player object is passed, update it directly
                playerObject.isFavorite = player.isFavorite;
            }
            savePlayerData(playerData, () => {
                console.log(`Favorite status for ${playerId} toggled to ${player.isFavorite}.`);
                // Update button UI immediately
                buttonElement.innerHTML = player.isFavorite ? '★' : '☆'; // Correctly render HTML entity
                buttonElement.title = player.isFavorite ? 'Unfavorite Player' : 'Favorite Player';
                // Optionally, re-render or update the specific card's class if needed elsewhere
                const cardElement = buttonElement.closest('.player-card');
                if (cardElement) {
                    if (player.isFavorite) {
                        cardElement.classList.add('favorite-player');
                    } else {
                        cardElement.classList.remove('favorite-player');
                    }
                }
            });
        } else {
            console.error('Player not found for toggling favorite status:', playerId);
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
            console.log(`[Username History] Added '${oldUsername}' to history for player ${playerObject.id}. New name: '${newUsername}'.`);
            return true; // Indicates history was updated
        }
    }
    return false; // No update to history needed
}
