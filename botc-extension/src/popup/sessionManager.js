/**
 * Session Manager Module
 * Handles all session-related functionality including:
 * - Fetching and displaying game sessions
 * - Processing player data within sessions
 * - Managing session UI components
 * - Handling game edition information
 */

/**
 * Get display name for game edition
 * @param {Object} edition - Edition data 
 * @returns {string} Formatted edition name
 */
function getEditionDisplay(edition) {
    if (edition.isOfficial) {
        switch (edition.id) {
            case 'tb':
                return 'Trouble Brewing';
            case 'snv':
                return 'Sects & Violets';
            case 'bmr':
                return 'Blood Moon Rising';
            default:
                return 'Official Script';
        }
    }
    return edition.name || 'Custom Script';
}

/**
 * Create edition tag element
 * @param {Object} edition - Edition data
 * @returns {HTMLElement} Edition tag element
 */
function createEditionTag(edition) {
    const tag = document.createElement('span');

    if (edition) {
        if (edition.isOfficial) {
            tag.className = 'edition-tag edition-official';
            tag.textContent = getEditionDisplay(edition); // Use the existing helper!
        } else { // Custom Script
            tag.className = 'edition-tag edition-custom';
            // Use name if available, otherwise fallback (getEditionDisplay handles this)
            tag.textContent = getEditionDisplay(edition);
        }
    } else { // No edition object provided at all
        tag.className = 'edition-tag edition-custom'; // Default style
        tag.textContent = 'Unknown Script'; // Default text
        console.warn('[Render Warn] Session has no edition data.');
    }
    return tag;
}

/**
 * Sort session players: Known > Storyteller > Playing > Spectator
 * @param {Object} session - Session data (contains usersAll)
 * @param {Object} playerData - Known player data
 * @param {Set<string>} storytellerIds - Set of IDs for storytellers in the session
 * @param {Set<string>} activePlayerIds - Set of IDs for active players in the session
 * @returns {Array} Sorted array of players from usersAll
 */
function sortSessionPlayers(session, playerData, storytellerIds, activePlayerIds) {
    const getPriority = (user) => {
        if (!user || !user.id) return 5; // Handle invalid data
        if (playerData[user.id]) return 1; // Known
        if (storytellerIds.has(user.id)) return 2; // Storyteller
        if (activePlayerIds.has(user.id)) return 3; // Playing
        return 4; // Spectator
    };

    // Create a shallow copy before sorting to avoid modifying the original array
    return [...session.usersAll].sort((a, b) => {
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);

        if (priorityA !== priorityB) {
            return priorityA - priorityB; // Sort by priority first
        }

        // Optional: Add secondary sort by username if priorities are the same
        const nameA = a.username || '';
        const nameB = b.username || '';
        return nameA.localeCompare(nameB);
    });
}

/**
 * Create player card element
 * @param {Object} user - User data from usersAll
 * @param {Object} playerData - Known player data
 * @param {Object} session - Session data
 * @param {Function} addPlayer - Function to add/update player
 * @param {Function} createUsernameHistoryModal - Function to create history modal
 * @param {boolean} isPlaying - Whether the user is in the session.players list
 * @returns {HTMLElement} Player card element
 */
function createPlayerCard(
    user, 
    playerData, 
    session, 
    addPlayerFunc, 
    createUsernameHistoryModalFunc,
    isPlaying
) {
    // Check if the user object or user.id is missing/invalid
    if (!user || !user.id) {
        console.warn('[Render Warn] Invalid user data encountered in createPlayerCard:', user);
        const errorCard = document.createElement('div');
        errorCard.className = 'player-card player-error';
        errorCard.textContent = 'Invalid Player Data';
        return errorCard; // Return a placeholder or skip rendering
    }

    const knownPlayer = playerData[user.id];
    const isKnown = knownPlayer !== undefined;
    const playerCard = document.createElement('div');

    if (isPlaying) {
        playerCard.classList.add('player-playing'); // Add playing class first if applicable
    }
    playerCard.classList.add('player-card'); // Add base class

    // Add rating class using the one from userManager.js
    const ratingClass = isKnown && window.getRatingClass ? window.getRatingClass(knownPlayer.score) : 'rating-unknown';
    playerCard.classList.add(ratingClass);

    playerCard.dataset.playerId = user.id;
    playerCard.dataset.playerName = user.username; // Store current username

    let isKnownPlayer = playerData[user.id]; // Use let as it can change
    const isStoryteller = session.storytellers.some(st => st.id === user.id);
    // playerCard.className = `player-card ${isKnownPlayer ? getRatingClass(playerData[user.id].score) : 'rating-unknown'}`;

    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';
    
    const nameContainer = document.createElement('div');
    nameContainer.style.display = 'flex';
    nameContainer.style.alignItems = 'center';
    nameContainer.style.gap = '8px';
    
    const nameEl = document.createElement('strong');
    nameEl.textContent = user.username;
    nameContainer.appendChild(nameEl);

    if (isStoryteller) {
        const stBadge = document.createElement('span');
        stBadge.className = 'storyteller-badge';
        stBadge.textContent = 'ST';
        nameContainer.appendChild(stBadge);
    }
    
    // Add username history indicator if known
    if (isKnownPlayer && playerData[user.id].usernameHistory && playerData[user.id].usernameHistory.length > 0) {
        const historyCount = playerData[user.id].usernameHistory.length;
        const historySpan = document.createElement('span');
        historySpan.style.fontSize = '12px';
        historySpan.style.color = '#666';
        historySpan.style.cursor = 'pointer';
        historySpan.textContent = `(${historyCount} names)`;
        historySpan.title = 'Click to view username history';
        historySpan.addEventListener('click', (e) => {
            e.stopPropagation();
            createUsernameHistoryModalFunc(playerData[user.id].usernameHistory, playerData[user.id].name);
        });
        nameContainer.appendChild(historySpan);
    }

    playerInfo.appendChild(nameContainer);

    if (isKnownPlayer) {
        const details = document.createElement('div');
        details.style.fontSize = '12px';
        details.style.marginTop = '4px';
        details.textContent = `Rating: ${playerData[user.id].score || 'Unknown'} ${playerData[user.id].notes ? `• ${playerData[user.id].notes}` : ''}`;
        playerInfo.appendChild(details);
    }

    const addButton = document.createElement('button');
    addButton.textContent = isKnownPlayer ? 'Update Player' : 'Add Player';
    addButton.addEventListener('click', () => {
        // Get current score/notes if known, otherwise use defaults
        const currentScore = isKnownPlayer ? playerData[user.id]?.score : '3';
        const currentNotes = isKnownPlayer ? playerData[user.id]?.notes : '';

        const score = prompt('Enter rating (1-5):', currentScore);
        if (score !== null) {
            const notes = prompt('Enter notes:', currentNotes);
            if (notes !== null) {
                // Define the UI update callback
                const updateUICallback = (updatedPlayerDataForUser) => {
                    console.log('Updating UI for player:', user.id, updatedPlayerDataForUser);
                    
                    // Update known status and main card class
                    isKnownPlayer = true; // Player is now known
                    playerCard.className = `player-card ${window.getRatingClass(updatedPlayerDataForUser.score)}`;

                    // Find or create the details div
                    let detailsDiv = playerInfo.querySelector('.player-details');
                    if (!detailsDiv) {
                        detailsDiv = document.createElement('div');
                        detailsDiv.className = 'player-details'; // Add a class for easier selection
                        detailsDiv.style.fontSize = '12px';
                        detailsDiv.style.marginTop = '4px';
                        playerInfo.appendChild(detailsDiv); // Append it if it didn't exist
                    }
                    detailsDiv.textContent = `Rating: ${updatedPlayerDataForUser.score || 'Unknown'} ${updatedPlayerDataForUser.notes ? `• ${updatedPlayerDataForUser.notes}` : ''}`;

                    // Update button text
                    addButton.textContent = 'Update Player';

                    // Check if history span needs to be added (if first time saving for this user)
                    const historySpanExists = nameContainer.querySelector('.history-span');
                    if (!historySpanExists && updatedPlayerDataForUser.usernameHistory && updatedPlayerDataForUser.usernameHistory.length > 0) {
                        const historyCount = updatedPlayerDataForUser.usernameHistory.length;
                        const historySpan = document.createElement('span');
                        historySpan.className = 'history-span'; // Add class for easier selection
                        historySpan.style.fontSize = '12px';
                        historySpan.style.color = '#666';
                        historySpan.style.cursor = 'pointer';
                        historySpan.textContent = `(${historyCount} names)`;
                        historySpan.title = 'Click to view username history';
                        historySpan.addEventListener('click', (e) => {
                            e.stopPropagation();
                            createUsernameHistoryModalFunc(updatedPlayerDataForUser.usernameHistory, updatedPlayerDataForUser.name);
                        });
                        nameContainer.appendChild(historySpan);
                    }
                };

                // Call addPlayer with the UI update callback
                addPlayerFunc(user.id, user.username, score, notes, updateUICallback);
            }
        }
    });

    playerCard.appendChild(playerInfo);
    playerCard.appendChild(addButton);
    return playerCard;
}

/**
 * Processes fetched session data to update username and session history if needed, then renders the UI.
 * @param {Array} sessions - Array of session objects.
 * @param {Object} initialPlayerData - Player data loaded before history checks.
 * @param {HTMLElement} resultDiv - Container for results.
 * @param {Object} options - Display options.
 * @param {Function} addPlayer - Function to add a player.
 * @param {Function} createUsernameHistoryModal - Function to create the history modal.
 * @param {Function} updateOnlineFavoritesListFunc - Function to update the online favorites list UI.
 */
function checkHistoryAndRender(sessions, initialPlayerData, resultDiv, options, addPlayerFunc, createUsernameHistoryModalFunc, updateOnlineFavoritesListFunc) {
    let updatedPlayerData = { ...initialPlayerData };
    let historyUpdatePromises = [];

    sessions.forEach(session => {
        session.usersAll.forEach(user => {
            // Check and update username history
            const usernamePromise = new Promise((resolve) => {
                updateUsernameHistoryIfNeeded(user.id, user.username, updatedPlayerData, (usernameChanged, dataAfterUsername) => {
                    if (usernameChanged) updatedPlayerData = dataAfterUsername;
                    resolve(); // Resolve regardless of change
                });
            });

            // Check and update session history (chained after username)
            const sessionHistoryPromise = usernamePromise.then(() => {
                return new Promise((resolve) => {
                    updateSessionHistoryIfNeeded(user.id, session.name, updatedPlayerData, (sessionChanged, dataAfterSession) => {
                        if (sessionChanged) updatedPlayerData = dataAfterSession;
                        resolve(); // Resolve regardless of change
                    });
                });
            });

            historyUpdatePromises.push(sessionHistoryPromise);
        });
    });

    // Wait for all history updates to potentially complete
    Promise.all(historyUpdatePromises)
        .then(() => {
            // Now render with the potentially updated player data
            renderSessions(
                sessions, 
                updatedPlayerData, 
                resultDiv, 
                options, 
                addPlayerFunc, 
                createUsernameHistoryModalFunc
            );

            // --- Update Online Favorites List ---
            // Construct the map of online players: { playerId: sessionName }
            const onlinePlayersMap = new Map();
            sessions.forEach(session => {
                if (session.usersAll && Array.isArray(session.usersAll)) {
                    session.usersAll.forEach(user => {
                        if (user.id) { 
                            onlinePlayersMap.set(user.id, session.name || 'Unknown Session');
                        }
                    });
                }
            });
            
            // Call the update function
            if (updateOnlineFavoritesListFunc) {
                updateOnlineFavoritesListFunc(updatedPlayerData, onlinePlayersMap);
            } else {
                console.warn('updateOnlineFavoritesListFunc not provided to checkHistoryAndRender');
            }

        })
        .catch(error => {
            console.error("Error processing player history updates:", error);
            // Fallback: Render with initial data if history processing fails
            renderSessions(sessions, initialPlayerData, resultDiv, options, addPlayerFunc, createUsernameHistoryModalFunc);
            
            // Maybe still try to update favorites with initial data?
            const onlinePlayersMap = new Map();
            sessions.forEach(session => {
                if (session.usersAll && Array.isArray(session.usersAll)) {
                    session.usersAll.forEach(user => {
                        if (user.id) { 
                            onlinePlayersMap.set(user.id, session.name || 'Unknown Session');
                        }
                    });
                }
            });
            if (updateOnlineFavoritesListFunc) {
                updateOnlineFavoritesListFunc(initialPlayerData, onlinePlayersMap); 
            } else {
                console.warn('updateOnlineFavoritesListFunc not provided to checkHistoryAndRender (in catch)');
            }
        });
}

/**
 * Renders the session data into the UI.
 * @param {Array} sessions - Array of session objects.
 * @param {Object} playerData - Final player data (potentially updated by history checks).
 * @param {HTMLElement} resultDiv - Container for results.
 * @param {Object} options - Display options.
 * @param {Function} addPlayer - Function to add a player.
 * @param {Function} createUsernameHistoryModal - Function to create the history modal.
 */
function renderSessions(
    sessions,
    playerData,
    resultDiv,
    options,
    addPlayerFunc,
    createUsernameHistoryModalFunc
) {
    // Always clear the results div before rendering
    if (resultDiv) {
        resultDiv.innerHTML = '';
    } else {
        console.error('[Render Error] resultDiv is null or undefined in renderSessions.');
        return; // Cannot render without a container
    }
 
    // Filter sessions based on options
    const filteredSessions = (sessions || []).filter(session => {
        if (options.officialOnly && !session.edition.isOfficial) return false;
        return true;
    });
 
    if (filteredSessions.length === 0) {
        console.log('No sessions to display after filtering.');
        resultDiv.innerHTML = '<p>No active sessions found matching the criteria.</p>';
        return;
    }
 
    filteredSessions.forEach((session, index) => {
        try {
            const sessionContainer = document.createElement('div');
            sessionContainer.className = 'session-container';

            const sessionHeader = document.createElement('div');
            sessionHeader.className = 'session-header';

            const sessionTitle = document.createElement('div');
            sessionTitle.className = 'session-title';
            
            const titleTextContainer = document.createElement('div');
            titleTextContainer.style.display = 'flex'; // Use flex to align items horizontally
            titleTextContainer.style.alignItems = 'center';
            titleTextContainer.style.gap = '8px'; // Add some space between elements

            const titleText = document.createElement('div');
            
            // Construct the new player count string
            const playersWithAssignedId = session.players ? session.players.filter(p => p && p.id).length : 0;
            const totalPlayerSlots = session.players ? session.players.length : 0; 
            const totalParticipants = session.usersAll ? session.usersAll.length : 0;

            const playerCountString = `Players: ${playersWithAssignedId}/${totalPlayerSlots} (${totalParticipants} total)`;

            titleText.innerHTML = `<strong>${session.name}</strong> <span style="color: #666">• Phase ${session.phase}${session.phase === 0 ? '<span class="phase-zero-indicator">In Between Games</span>' : ''} • ${playerCountString}</span>`;
            titleTextContainer.appendChild(titleText);

            sessionTitle.appendChild(titleTextContainer); // Add the container with title+indicators

            // Add edition tag
            const editionTag = createEditionTag(session.edition);
            sessionTitle.appendChild(editionTag);

            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Show Players';
            toggleButton.style.padding = '4px 8px';
            toggleButton.style.fontSize = '12px';

            sessionHeader.appendChild(sessionTitle);
            sessionHeader.appendChild(toggleButton);

            const sessionContent = document.createElement('div');
            sessionContent.className = 'session-content';
            sessionContent.style.display = 'none';

            // Create a Set of active player IDs for quick lookup (filter out nulls)
            const activePlayerIds = new Set(
                (session.players || []).filter(p => p && p.id).map(p => p.id)
            );

            // Create a Set of storyteller IDs
            const storytellerIds = new Set(
                (session.storytellers || []).filter(st => st && st.id).map(st => st.id)
            );

            // Sort players by known status, using updated playerData
            const sortedPlayers = sortSessionPlayers(session, playerData, storytellerIds, activePlayerIds);
            sortedPlayers.forEach(user => {
                // Determine if this user is an active player
                const isPlaying = activePlayerIds.has(user.id);
                // Create player card for each user
                const playerCardElement = createPlayerCard(
                    user, 
                    playerData, 
                    session, 
                    addPlayerFunc, 
                    createUsernameHistoryModalFunc,
                    isPlaying // Pass playing status
                );
                sessionContent.appendChild(playerCardElement);
            });

            toggleButton.addEventListener('click', () => {
                const isHidden = sessionContent.style.display === 'none';
                sessionContent.style.display = isHidden ? 'block' : 'none';
                toggleButton.textContent = isHidden ? 'Hide Players' : 'Show Players';
            });

            sessionContainer.appendChild(sessionHeader);
            sessionContainer.appendChild(sessionContent);
            resultDiv.appendChild(sessionContainer);
        } catch (error) {
            console.error(`[Render Error] Failed to render session ${index}: ${session?.name}. Error:`, error, 'Session data:', session);
            // Optionally display an error message in the UI for this specific session
            const errorDiv = document.createElement('div');
            errorDiv.className = 'session-container error'; // Style appropriately
            errorDiv.textContent = `Error rendering session: ${session.name || 'Unknown Session'}. See console for details.`;
            resultDiv.appendChild(errorDiv);
        }
    });

}

/**
 * Fetch session data, check/update history, then display sessions.
 * @param {Function} loadPlayerDataFunc - Function to load player data.
 * @param {Function} addPlayerFunc - Function to add a player.
 * @param {Function} createUsernameHistoryModalFunc - Function to create the username history modal.
 * @param {Function} updateOnlineFavoritesListFunc - Function to update the online favorites list UI.
 * @param {HTMLElement} resultDiv - Container for session results.
 * @param {Object} [options={}] - Filtering/display options.
 * @param {Function} [onCompleteCallback=null] - Optional callback after completion.
 */
function fetchAndDisplaySessions(
    loadPlayerDataFunc, 
    addPlayerFunc, 
    createUsernameHistoryModalFunc,
    updateOnlineFavoritesListFunc, 
    resultDiv,
    options = {},
    onCompleteCallback = null
) {
    chrome.runtime.sendMessage({ action: "fetchSessions" }, (response) => {
        if (response && response.error) {
            console.error("Error fetching sessions:", response.error);
            resultDiv.innerHTML = `<p class='error-message'>Error fetching sessions: ${response.error}</p>`;
            if (onCompleteCallback) onCompleteCallback(null, response.error); // Indicate error
            return;
        }
        if (!response || !response.sessions) {
            console.error("No sessions data received.");
            resultDiv.innerHTML = "<p>No active games found, or the format was unexpected.</p>";
            if (onCompleteCallback) onCompleteCallback([], {}); // No sessions, empty player data map
            return;
        }

        const backendSessions = response.sessions;

        // Sort sessions by phase (0 first, then ascending)
        backendSessions.sort((a, b) => {
            const phaseA = typeof a.phase === 'number' ? a.phase : Infinity; // Treat non-numbers as lowest priority
            const phaseB = typeof b.phase === 'number' ? b.phase : Infinity;

            if (phaseA === 0 && phaseB !== 0) return -1; // Phase 0 comes first
            if (phaseB === 0 && phaseA !== 0) return 1;  // Phase 0 comes first
            return phaseA - phaseB; // Otherwise, sort numerically ascending
        });

        // 1. Load current player data
        loadPlayerDataFunc(initialPlayerData => {
            // --- Calculate and Display Fetch Statistics (Optional: can be kept or removed) ---
            const totalSessions = backendSessions.length;
            const uniquePlayerIds = new Set();
            backendSessions.forEach(session => {
                (session.usersAll || []).forEach(user => {
                    if (user && user.id) {
                        uniquePlayerIds.add(user.id);
                    }
                });
            });
            const totalUniquePlayers = uniquePlayerIds.size;
            let knownPlayerCount = 0;
            uniquePlayerIds.forEach(id => {
                if (initialPlayerData[id]) {
                    knownPlayerCount++;
                }
            });

            const statsSpan = document.getElementById('fetchStats');
            if (statsSpan) {
                statsSpan.textContent = `(${totalUniquePlayers} Players | ${knownPlayerCount} Known | ${totalSessions} Sessions)`;
            } else {
                console.warn("fetchStats element not found in popup.html");
            }
            // --- End Statistics Calculation ---

            // 2. Call checkHistoryAndRender to handle history updates and rendering
            // It will internally call renderSessions after processing.
            checkHistoryAndRender(
                backendSessions, 
                initialPlayerData, 
                resultDiv, 
                options, 
                addPlayerFunc, 
                createUsernameHistoryModalFunc,
                updateOnlineFavoritesListFunc // Pass it through
            );
            // The renderSessions function inside checkHistoryAndRender handles UI updates.
            // If onCompleteCallback needs to be tied to the full completion including rendering,
            // checkHistoryAndRender might need to be modified to accept and call it,
            // or we assume completion once checkHistoryAndRender is invoked if it's synchronous enough for this purpose.
            // For now, calling it here means it's called after initiating the history check & render process.
            if (onCompleteCallback) {
                // Consider that checkHistoryAndRender is asynchronous due to promises.
                // A more robust way would be for checkHistoryAndRender to return a promise or accept a callback.
                // For simplicity now, calling it after invoking checkHistoryAndRender.
                // If checkHistoryAndRender needs to signal completion, its structure would need to change.
                // Assuming onCompleteCallback is mainly to signal that fetching and *initiation* of processing is done.
                Promise.all(backendSessions.flatMap(session => 
                    (session.usersAll || []).map(user => 
                        new Promise(resolve => {
                            // This is a placeholder to ensure callback runs after promises in checkHistoryAndRender *could* have run.
                            // A better approach is for checkHistoryAndRender to return a promise itself.
                            setTimeout(resolve, 0); 
                        })
                    )
                )).then(() => {
                    if (onCompleteCallback) onCompleteCallback(backendSessions);
                });
            }
        });
    });
}

// --- Expose function needed by popup.js ---
window.fetchAndDisplaySessions = fetchAndDisplaySessions;
window.renderSessions = renderSessions; // Expose renderSessions
