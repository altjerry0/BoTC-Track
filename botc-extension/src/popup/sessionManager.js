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

// NEW HELPER FUNCTION
function getScoreCategory(score) {
    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore)) return 'unknown';
    if (numericScore >= 4) return 'good';
    if (numericScore === 3) return 'neutral';
    if (numericScore <= 2 && numericScore >= 1) return 'bad';
    return 'unknown';
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
    if (isKnownPlayer) {
        addButton.textContent = 'Update Player'; // Keep as text for now, or decide on an icon
        // TODO: Consider an edit icon for 'Update Player' and player-action-button class
    } else {
        addButton.innerHTML = `<img src="../icons/addbutton.svg" alt="Add Player" class="button-icon" />`;
        addButton.classList.add('player-action-button');
        addButton.title = 'Add this player to your known players list';
    }

    addButton.addEventListener('click', () => {
        // Get current score/notes if known, otherwise use defaults
        const knownPlayer = playerData[user.id];
        const currentScore = knownPlayer ? (knownPlayer.score === null || knownPlayer.score === undefined ? '' : knownPlayer.score.toString()) : '3'; // Default to 3 if new
        const currentNotes = knownPlayer ? (knownPlayer.notes || '') : '';

        const modalTitle = `Update Player: ${user.name || `ID: ${user.id}`}`;
        const modalBodyHtml = `
            <p>Update details for <strong>${user.name || `ID: ${user.id}`}</strong>. This will add them to your known players list if they aren't already, or update their existing record.</p>
            <div>
                <label for="modalSessionPlayerScore">Score (1-5, optional):</label>
                <input type="number" id="modalSessionPlayerScore" value="${currentScore}" min="1" max="5">
            </div>
            <div>
                <label for="modalSessionPlayerNotes">Notes (optional):</label>
                <textarea id="modalSessionPlayerNotes" rows="3">${currentNotes}</textarea>
            </div>
        `;

        ModalManager.showModal(modalTitle, modalBodyHtml, [
            {
                text: 'Cancel',
                className: 'modal-button-secondary'
            },
            {
                text: 'Save Details',
                className: 'modal-button-primary',
                callback: async () => {
                    const scoreStr = document.getElementById('modalSessionPlayerScore').value.trim();
                    const notes = document.getElementById('modalSessionPlayerNotes').value.trim();

                    let score = null;
                    if (scoreStr) {
                        const parsedScore = parseInt(scoreStr, 10);
                        if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
                            ModalManager.showAlert('Invalid Input', 'Invalid score. Must be a number between 1 and 5. Score will not be saved unless corrected.');
                            return; // Keep modal open for correction
                        } else {
                            score = parsedScore;
                        }
                    }

                    // Define the UI update callback for after player data is saved
                    const uiUpdateCallback = (updatedPlayer) => {
                        if (updatedPlayer) {
                            // Re-render this specific player card or the whole list if simpler
                            // For now, let's assume a full list refresh might be handled by a broader mechanism
                            // or that renderSessions might be called again.
                            // We could also update the card directly if we have its reference.
                            console.log(`Player ${updatedPlayer.id} updated from session card interaction.`);
                            ModalManager.showAlert('Success', `Player ${user.name || user.id} details saved.`);
                            // Potentially refresh the session list or just this card
                            if (typeof window.fetchAndDisplaySessions === 'function') {
                                // This might be too broad, ideally just re-render the known players list if it's visible
                                // and update this specific card's display.
                                // For now, just log and show success.
                            }
                            renderKnownPlayers(); // Re-render the user management tab if it's the active one
                        }
                    };

                    try {
                        // addPlayerFunc is userManager.addOrUpdatePlayer
                        // It needs: id, name, score, notes, isFavorite (preserve if known), usernameHistory (preserve if known)
                        const isFavorite = knownPlayer ? knownPlayer.isFavorite : false;
                        const usernameHistory = knownPlayer ? knownPlayer.usernameHistory : [];
                        await addPlayerFunc(user.id, user.name, score, notes, isFavorite, usernameHistory, uiUpdateCallback);
                        ModalManager.closeModal(); // Close after successful save
                    } catch (error) {
                        console.error('Failed to save player details from session card:', error);
                        ModalManager.showAlert('Error', `Failed to save player details: ${error.message}`);
                    }
                },
                closesModal: false // Handle close explicitly
            }
        ]);
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
function checkHistoryAndRender(
    sessions,
    initialPlayerData,
    resultDiv,
    options,
    addPlayerFunc,
    createUsernameHistoryModalFunc,
    updateOnlineFavoritesListFunc
) {
    // Deep clone initialPlayerData for modifications to avoid side effects on the original object
    const processedPlayerData = JSON.parse(JSON.stringify(initialPlayerData)); 
    let playerDataWasActuallyUpdatedDuringHistoryCheck = false;

    // Process sessions for potential player data updates (e.g., username history, session history)
    sessions.forEach(session => {
        if (session.usersAll && Array.isArray(session.usersAll)) {
            session.usersAll.forEach(userInSession => {
                const userId = userInSession.id ? userInSession.id.toString() : null;
                const userNameFromApi = userInSession.username ? userInSession.username.trim() : null;

                if (userId && processedPlayerData[userId]) {
                    const player = processedPlayerData[userId];
                    let playerUpdatedThisPass = false;

                    // Username History Update
                    if (userNameFromApi && player.name !== userNameFromApi) {
                        const oldUsername = player.name;
                        player.name = userNameFromApi;
                        if (!player.usernameHistory) player.usernameHistory = [];
                        const lastHistoryEntry = player.usernameHistory.length > 0 ? player.usernameHistory[0].username : null;
                        if (oldUsername && (!lastHistoryEntry || lastHistoryEntry.toLowerCase() !== oldUsername.toLowerCase())) {
                            player.usernameHistory.unshift({ username: oldUsername, timestamp: Date.now() });
                        }
                        playerUpdatedThisPass = true;
                    }

                    // Session History Update
                    const currentSessionIdentifier = session.name ? session.name.toString() : (session.id ? session.id.toString() : null);
                    if (currentSessionIdentifier) {
                        if (!player.sessionHistory) player.sessionHistory = [];
                        if (!player.sessionHistory.includes(currentSessionIdentifier)) {
                            player.sessionHistory.push(currentSessionIdentifier);
                            player.uniqueSessionCount = (player.uniqueSessionCount || 0) + 1;
                            playerUpdatedThisPass = true;
                        }
                    }
                    
                    if (playerUpdatedThisPass) {
                        playerDataWasActuallyUpdatedDuringHistoryCheck = true;
                    }
                }
            });
        }
    });

    // Save player data if it was updated during the history check
    if (playerDataWasActuallyUpdatedDuringHistoryCheck) {
        chrome.storage.local.set({ playerData: processedPlayerData }, () => {
            if (chrome.runtime.lastError) {
                console.error('[FG SessionRender] Error saving player data after history check:', chrome.runtime.lastError.message);
                // Optionally: Display a user-friendly error message here using a safe method
                // e.g., ModalManager.showNotification("Error saving updated player data.", true, 3000);
            } else {
                console.log('[FG SessionRender] Player data updated with historical info and saved.');
            }
        });
    }

    // Sort sessions: ones with the current user first, then by date (original order)
    if (window.currentUserID && sessions && Array.isArray(sessions)) {
        sessions.sort((a, b) => {
            const userInA = a.usersAll && a.usersAll.some(u => u.id && u.id.toString() === window.currentUserID.toString());
            const userInB = b.usersAll && b.usersAll.some(u => u.id && u.id.toString() === window.currentUserID.toString());

            if (userInA && !userInB) return -1; // A comes first
            if (!userInA && userInB) return 1;  // B comes first
            // If both are active or both are not, maintain original relative order (often chronological from API)
            return 0; 
        });
    }

    // Call renderSessions with potentially updated player data and sorted sessions
    renderSessions(
        sessions, 
        playerDataWasActuallyUpdatedDuringHistoryCheck ? processedPlayerData : initialPlayerData, 
        resultDiv, 
        options, 
        addPlayerFunc, 
        createUsernameHistoryModalFunc
    );

    // Update the online favorites list if the function is provided
    if (updateOnlineFavoritesListFunc) {
        // Construct the map of online players: { playerId: sessionName or true }
        const onlinePlayersMap = new Map();
        sessions.forEach(session => {
            if (session.usersAll && Array.isArray(session.usersAll)) {
                session.usersAll.forEach(user => {
                    if (user.id) { 
                        // Storing session name can be useful, or just true if presence is enough
                        onlinePlayersMap.set(user.id.toString(), session.name || true);
                    }
                });
            }
        });

        // Convert Map to plain object for safer cross-context passing
        const onlinePlayersObject = Object.fromEntries(onlinePlayersMap);

        // Now call the function from popup.js context if it exists
        if (typeof window.updateOnlineFavoritesListFunc === 'function') {
            console.log('[SessionManager] onlinePlayersObject before passing:', onlinePlayersObject);
            window.updateOnlineFavoritesListFunc(processedPlayerData, onlinePlayersObject);
        } else {
            console.warn("updateOnlineFavoritesListFunc not found on window object. Is popup.js loaded and function exposed?");
        }
    } else {
        // console.warn('updateOnlineFavoritesListFunc not provided to checkHistoryAndRender');
    }
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
        if (options.officialOnly && session.edition && !session.edition.isOfficial) return false; // Check session.edition exists
        return true;
    });
 
    if (filteredSessions.length === 0) {
        // console.log('No sessions to display after filtering.'); // Can be noisy, enable for debug
        resultDiv.innerHTML = '<p>No active sessions found matching the criteria.</p>';
        return;
    }
 
    filteredSessions.forEach((session, index) => {
        try {
            const sessionContainer = document.createElement('div');
            sessionContainer.className = 'session-container';
            sessionContainer.dataset.sessionId = session.id; // Store session ID for potential future use

            // Check if the current user is present in this session's usersAll array
            if (window.currentUserID && session.usersAll && Array.isArray(session.usersAll)) {
                const isCurrentUserInSession = session.usersAll.some(u => u.id && u.id.toString() === window.currentUserID.toString());
                if (isCurrentUserInSession) {
                    sessionContainer.classList.add('active-user-session');
                }
            }

            const sessionHeader = document.createElement('div');
            sessionHeader.className = 'session-header';

            const sessionTitle = document.createElement('div');
            sessionTitle.className = 'session-title';
            
            const titleTextContainer = document.createElement('div'); // Main container for title line elements
            titleTextContainer.className = 'session-title-line'; // Assign a class for potential flex styling if session-title itself isn't flex

            const mainTitleInfo = document.createElement('div');
            mainTitleInfo.className = 'session-main-info';
            
            // Construct the new player count string
            const playersWithAssignedId = session.players ? session.players.filter(p => p && p.id).length : 0;
            const totalPlayerSlots = session.players ? session.players.length : 0; 
            const totalParticipants = session.usersAll ? session.usersAll.length : 0;

            const playerCountString = `Players: ${playersWithAssignedId}/${totalPlayerSlots} (${totalParticipants} total)`;

            const titleText = document.createElement('div');
            titleText.innerHTML = `<strong>${session.name}</strong> <span style="color: #666">• Phase ${session.phase}${session.phase === 0 ? '<span class="phase-zero-indicator">In Between Games</span>' : ''} • ${playerCountString}</span>`;
            mainTitleInfo.appendChild(titleText);

            // *** NEW: Player Score Indicators ***
            let scoreIndicatorsContainer; // Declare here to be in scope
            if (playerData && session.usersAll) {
                let good_scores = 0;
                let neutral_scores = 0;
                let bad_scores = 0;

                session.usersAll.forEach(userInSession => {
                    if (userInSession && userInSession.id && playerData[userInSession.id]) {
                        const knownPlayer = playerData[userInSession.id];
                        const category = getScoreCategory(knownPlayer.score);
                        if (category === 'good') good_scores++;
                        else if (category === 'neutral') neutral_scores++;
                        else if (category === 'bad') bad_scores++;
                    }
                });

                let indicatorsHtml = ''; // Changed const to let
                if (good_scores > 0) {
                    indicatorsHtml += `<span class="score-good" title="Good (Score 4-5)">+${good_scores}</span> `;
                }
                if (neutral_scores > 0) {
                    indicatorsHtml += `<span class="score-neutral" title="Neutral (Score 3)">●${neutral_scores}</span> `;
                }
                if (bad_scores > 0) {
                    indicatorsHtml += `<span class="score-bad" title="Bad (Score 1-2)">-${bad_scores}</span>`;
                }
                
                if (indicatorsHtml.trim() !== '') {
                    // Create container only if there's content
                    scoreIndicatorsContainer = document.createElement('span');
                    scoreIndicatorsContainer.className = 'session-player-score-indicators';
                    scoreIndicatorsContainer.innerHTML = indicatorsHtml.trim();
                }
            }
            // *** END NEW: Player Score Indicators ***

            titleTextContainer.appendChild(mainTitleInfo);

            // Add edition tag to titleTextContainer, after mainTitleInfo
            const editionTag = createEditionTag(session.edition);
            titleTextContainer.appendChild(editionTag);

            sessionTitle.appendChild(titleTextContainer); // Add the container with title + edition

            // Create a new container for right-side controls (indicators + toggle button)
            const rightHeaderControls = document.createElement('div');
            rightHeaderControls.className = 'session-header-right-controls';

            // Add score indicators to the new right-side container IF they exist
            if (scoreIndicatorsContainer) {
                rightHeaderControls.appendChild(scoreIndicatorsContainer);
            }

            const toggleButton = document.createElement('button');
            toggleButton.classList.add('session-toggle-button'); // Add class
            toggleButton.innerHTML = '&#9660;'; // Down arrow for 'Show Players'
            toggleButton.title = 'Show players in this session';
            rightHeaderControls.appendChild(toggleButton); // Add toggle button to the new container

            sessionHeader.appendChild(sessionTitle);
            sessionHeader.appendChild(rightHeaderControls); // Add the new right-side controls container to the header

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
                if (isHidden) {
                    toggleButton.innerHTML = '&#9650;'; // Up arrow for 'Hide Players'
                    toggleButton.title = 'Hide players in this session';
                } else {
                    toggleButton.innerHTML = '&#9660;'; // Down arrow for 'Show Players'
                    toggleButton.title = 'Show players in this session';
                }
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
