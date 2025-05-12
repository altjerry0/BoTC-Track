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

        // Create modal body using DOM manipulation
        const modalBodyContent = document.createElement('div');

        const infoParagraph = document.createElement('p');
        infoParagraph.innerHTML = `Update details for <strong>${user.name || `ID: ${user.id}`}</strong>. This will add them to your known players list if they aren't already, or update their existing record.`; // InnerHTML ok here as WE control the structure
        modalBodyContent.appendChild(infoParagraph);

        // Score Input
        const scoreDiv = document.createElement('div');
        const scoreLabel = document.createElement('label');
        scoreLabel.htmlFor = 'modalSessionPlayerScore';
        scoreLabel.textContent = 'Score (1-5, optional):';
        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.id = 'modalSessionPlayerScore';
        scoreInput.value = currentScore;
        scoreInput.min = '1';
        scoreInput.max = '5';
        scoreDiv.appendChild(scoreLabel);
        scoreDiv.appendChild(scoreInput);
        modalBodyContent.appendChild(scoreDiv);

        // Notes Input
        const notesDiv = document.createElement('div');
        const notesLabel = document.createElement('label');
        notesLabel.htmlFor = 'modalSessionPlayerNotes';
        notesLabel.textContent = 'Notes (optional):';
        const notesTextarea = document.createElement('textarea');
        notesTextarea.id = 'modalSessionPlayerNotes';
        notesTextarea.rows = 3;
        notesTextarea.textContent = currentNotes; // Use textContent for safety
        notesDiv.appendChild(notesLabel);
        notesDiv.appendChild(notesTextarea);
        modalBodyContent.appendChild(notesDiv);

        // Show the modal with the created DOM element
        ModalManager.showModal(modalTitle, modalBodyContent, [
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
async function checkHistoryAndRender(
    sessions,
    initialPlayerData,
    resultDiv,
    options,
    addPlayerFunc,
    createUsernameHistoryModalFunc,
    updateOnlineFavoritesListFunc
) {
    let playerData = JSON.parse(JSON.stringify(initialPlayerData)); // Deep copy to avoid modifying the original
    let playerDataNeedsSave = false;

    // Update username and session history for known players
    for (const session of sessions) {
        if (session.usersAll && Array.isArray(session.usersAll)) {
            for (const userInSession of session.usersAll) {
                const userId = userInSession.id ? String(userInSession.id) : null;
                let userNameFromApi = userInSession.username ? userInSession.username.trim() : null;

                // --- Fallback: Fetch username if missing from session data ---
                if (!userNameFromApi && userId) {
                    console.warn(`[SM CheckHistory] Username missing for ID ${userId} in session '${session.name}'. Attempting API lookup.`);
                    try {
                        const lookupResponse = await window.sendMessagePromise({ 
                            type: 'GET_USERNAME_BY_ID', 
                            payload: { playerId: userId } 
                        });

                        if (lookupResponse && lookupResponse.username) {
                            userNameFromApi = lookupResponse.username;
                            console.log(`[SM CheckHistory] Successfully fetched username '${userNameFromApi}' for ID ${userId}.`);
                        } else if (lookupResponse && lookupResponse.error) {
                            console.error(`[SM CheckHistory] API lookup failed for ID ${userId}: ${lookupResponse.error}`);
                        } else {
                            console.error(`[SM CheckHistory] API lookup for ID ${userId} returned unexpected response:`, lookupResponse);
                        }
                    } catch (error) {
                        console.error(`[SM CheckHistory] Error during sendMessagePromise for username lookup (ID: ${userId}):`, error);
                    }
                }
                // --- End Fallback ---

                if (userId && playerData[userId]) {
                    const player = playerData[userId];
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
                        playerDataNeedsSave = true;
                    }
                }
            }
        }
    }

    // Sort sessions: prioritize those where the current user is active
    if (window.currentUserID) {
        sessions.sort((a, b) => {
            const currentUserIdStr = String(window.currentUserID);
            
            // 1. Check if current user is a participant (using session.usersAll)
            const aHasCurrentUser = a.usersAll && a.usersAll.some(user => String(user.id) === currentUserIdStr);
            const bHasCurrentUser = b.usersAll && b.usersAll.some(user => String(user.id) === currentUserIdStr);

            if (aHasCurrentUser && !bHasCurrentUser) return -1; // a comes first
            if (!aHasCurrentUser && bHasCurrentUser) return 1;  // b comes first

            // 2. If user participation is the same, check if it's the active tab's game (using liveGameInfo)
            const aIsActiveTabGame = window.liveGameInfo && 
                                      window.liveGameInfo.storytellerId && 
                                      a.storytellers && a.storytellers.length > 0 && 
                                      String(window.liveGameInfo.storytellerId) === String(a.storytellers[0].id);

            const bIsActiveTabGame = window.liveGameInfo && 
                                      window.liveGameInfo.storytellerId && 
                                      b.storytellers && b.storytellers.length > 0 && 
                                      String(window.liveGameInfo.storytellerId) === String(b.storytellers[0].id);

            if (aIsActiveTabGame && !bIsActiveTabGame) return -1; // a comes first
            if (!aIsActiveTabGame && bIsActiveTabGame) return 1;  // b comes first

            // 3. Fallback: Sort by creation timestamp (most recent first)
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Sort descending by time
        });
    }

    // Update online favorites list UI using the centralized function passed from popup.js
    if (updateOnlineFavoritesListFunc) {
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
            updateOnlineFavoritesListFunc(playerData, onlinePlayersObject);
        } else {
            console.warn("updateOnlineFavoritesListFunc not found on window object. Is popup.js loaded and function exposed?");
        }
    } else {
        // console.warn('updateOnlineFavoritesListFunc not provided to checkHistoryAndRender');
    }

    // Save player data if it was updated during the history check
    if (playerDataNeedsSave) {
        chrome.storage.local.set({ playerData: playerData }, () => {
            if (chrome.runtime.lastError) {
                console.error('[FG SessionRender] Error saving player data after history check:', chrome.runtime.lastError.message);
                // Optionally: Display a user-friendly error message here using a safe method
                // e.g., ModalManager.showNotification("Error saving updated player data.", true, 3000);
            } else {
                console.log('[FG SessionRender] Player data updated with historical info and saved.');
            }
        });
    }

    // Call renderSessions with potentially updated player data and sorted sessions
    renderSessions(
        sessions, 
        playerData, 
        resultDiv, 
        options, 
        addPlayerFunc, 
        createUsernameHistoryModalFunc
    );
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
    resultDiv.innerHTML = ''; // Clear previous results

    if (!sessions || sessions.length === 0) {
        resultDiv.innerHTML = '<p class="no-sessions-message">No sessions found.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    let displayedCount = 0;

    sessions.forEach(session => {
        if (!session || !session.name) { 
            console.warn("[Render Warn] Invalid session object or missing session name:", session);
            return; // Skip this invalid session object
        }

        if (options && options.officialOnly && session.edition && !session.edition.isOfficial) {
            return; // Skip non-official if filter is active
        }

        displayedCount++;
        const sessionContainer = document.createElement('div');
        sessionContainer.className = 'session-container';
        sessionContainer.dataset.sessionId = session.name; 

        // Highlight if current user is in this session
        // Logic now based on live game info from content script
        const isUserDetectedInLiveGame = window.liveGameInfo && 
                                         window.liveGameInfo.playerIds &&
                                         window.currentUserID && 
                                         window.liveGameInfo.playerIds.includes(String(window.currentUserID));

        const isLiveGameMatchingThisSession = window.liveGameInfo && 
                                              window.liveGameInfo.storytellerId &&
                                              session.storytellers && 
                                              session.storytellers.length > 0 && 
                                              String(window.liveGameInfo.storytellerId) === String(session.storytellers[0].id);

        // Highlight if this session matches the game in the active botc.app tab
        sessionContainer.classList.remove('current-tab-game-session'); // Clear previous state
        if (isLiveGameMatchingThisSession) {
            sessionContainer.classList.add('current-tab-game-session');
            // console.log(`[SM] Session "${session.name}" marked as current-tab-game-session.`);
        }

        // Separately, highlight if the logged-in user is part of this session's roster (from backend data)
        sessionContainer.classList.remove('active-user-session'); // Clear previous state
        if (window.currentUserID && session.usersAll && session.usersAll.some(user => user && String(user.id) === String(window.currentUserID))) {
            sessionContainer.classList.add('active-user-session');
            // console.log(`[SM] Session "${session.name}" marked as active-user-session for user ${window.currentUserID}.`);
        }

        // Determine player roles for sorting and display within this session
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
        fragment.appendChild(sessionContainer);
    });

    resultDiv.appendChild(fragment);
}

/**
 * Fetch session data, check/update history, then display sessions.
 * @param {Function} addPlayerFunc - Function to add a player.
 * @param {Function} createUsernameHistoryModalFunc - Function to create the username history modal.
 * @param {Function} updateOnlineFavoritesListFunc - Function to update the online favorites list UI.
 * @param {HTMLElement} resultDiv - Container for session results.
 * @param {Object} [options={}] - Filtering/display options.
 * @param {Function} [onCompleteCallback=null] - Optional callback after completion.
 */
async function fetchAndDisplaySessions(
    addPlayerFunc,
    createUsernameHistoryModalFunc,
    updateOnlineFavoritesListFunc,
    resultDiv,
    options = {},
    onCompleteCallback = null
) {
    resultDiv.innerHTML = '<div class="loading-sessions"><div class="spinner"></div> Fetching sessions...</div>';

    // Fetch the latest liveGameInfo from background script
    try {
        const liveGameInfoResponse = await window.sendMessagePromise({ type: 'GET_CURRENT_GAME_INFO' });
        window.liveGameInfo = liveGameInfoResponse ? liveGameInfoResponse.gameInfo : null;
        // console.log('[SM] Fetched liveGameInfo in sessionManager:', JSON.stringify(window.liveGameInfo, null, 2));
    } catch (error) {
        console.error('[SM] Error fetching liveGameInfo in sessionManager:', error);
        window.liveGameInfo = null; // Ensure it's null on error
    }

    // Directly use window.playerData which should be populated by popup.js
    // Ensure it defaults to an empty object if window.playerData is null or undefined
    const currentPlayerData = window.playerData || {};
    // console.log('[SM] Using window.playerData in fetchAndDisplaySessions. Player count:', Object.keys(currentPlayerData).length);
    if (Object.keys(currentPlayerData).length === 0) {
        console.warn('[SM] window.playerData is empty or not yet populated when fetchAndDisplaySessions is called.');
        // popup.js should ensure window.playerData is populated before calling this.
    }

    chrome.runtime.sendMessage({ action: "fetchSessions" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("[SM] Error sending fetchSessions message:", chrome.runtime.lastError.message);
            resultDiv.innerHTML = `<p class='error-message'>Error communicating with background: ${chrome.runtime.lastError.message}</p>`;
            if (onCompleteCallback) onCompleteCallback(null, chrome.runtime.lastError.message);
            return;
        }

        if (response && response.error) {
            console.error("[SM] Error fetching sessions from background:", response.error);
            resultDiv.innerHTML = `<p class='error-message'>Error fetching sessions: ${response.error}</p>`;
            if (onCompleteCallback) onCompleteCallback(null, response.error);
            return;
        }

        if (!response || !response.sessions) {
            console.warn("[SM] No sessions found or invalid response from background. Response:", response);
            resultDiv.innerHTML = "<p class='no-sessions'>No active sessions found, or could not retrieve session data.</p>";
            // Still call checkHistoryAndRender with empty sessions to ensure UI consistency (e.g., clearing old results)
            // and to correctly use currentPlayerData for any residual UI elements that might depend on it.
            checkHistoryAndRender(
                [], // empty sessions array
                currentPlayerData, // Pass the currentPlayerData (from window.playerData)
                resultDiv,
                options,
                addPlayerFunc,
                createUsernameHistoryModalFunc,
                updateOnlineFavoritesListFunc
            );
            if (onCompleteCallback) onCompleteCallback([]); // Indicate successful fetch (of no sessions)
            return;
        }

        const backendSessions = response.sessions;
        // console.log('[SM] Received sessions from background:', backendSessions.length);

        // --- Sort sessions by game phase ---
        backendSessions.sort((a, b) => {
            const phaseA = (typeof a.phase === 'number' && !isNaN(a.phase)) ? a.phase : Infinity;
            const phaseB = (typeof b.phase === 'number' && !isNaN(b.phase)) ? b.phase : Infinity;

            if (phaseA === 0 && phaseB !== 0) return -1; // Phase 0 (active game) comes first
            if (phaseB === 0 && phaseA !== 0) return 1;
            return phaseA - phaseB; // Otherwise, sort numerically ascending
        });

        // --- Calculate and Display Fetch Statistics ---
        const totalSessions = backendSessions.length;
        const uniquePlayerIds = new Set();
        backendSessions.forEach(session => {
            (session.usersAll || []).forEach(user => {
                if (user && user.id) {
                    uniquePlayerIds.add(user.id.toString()); // Ensure IDs are strings
                }
            });
        });
        const totalUniquePlayers = uniquePlayerIds.size;
        let knownPlayerCount = 0;

        // console.log('[SM] Stats: currentPlayerData type:', typeof currentPlayerData, 'Is null?', currentPlayerData === null, 'Keys available:', Object.keys(currentPlayerData).length);
        if (typeof currentPlayerData !== 'object' || currentPlayerData === null) {
            console.error('[SM] CRITICAL: currentPlayerData is NOT a valid object for stats calculation!', currentPlayerData);
        } else {
            uniquePlayerIds.forEach(id => {
                if (currentPlayerData[id]) { // Use currentPlayerData
                    knownPlayerCount++;
                }
            });
        }

        const statsSpan = document.getElementById('fetchStats');
        if (statsSpan) {
            statsSpan.textContent = `(${totalUniquePlayers} Players | ${knownPlayerCount} Known | ${totalSessions} Sessions)`;
        } else {
            // console.warn("[SM] fetchStats element not found in popup.html"); // Less noisy log
        }
        // --- End Statistics Calculation ---

        // Call checkHistoryAndRender to handle history updates and rendering
        checkHistoryAndRender(
            backendSessions,
            currentPlayerData, // Pass currentPlayerData (which is from window.playerData)
            resultDiv,
            options,
            addPlayerFunc,
            createUsernameHistoryModalFunc,
            updateOnlineFavoritesListFunc
        );

        if (onCompleteCallback) {
            // Ensure callback is executed after the current execution stack clears,
            // allowing checkHistoryAndRender to initiate its asynchronous operations.
            Promise.resolve().then(() => {
                 if (onCompleteCallback) onCompleteCallback(backendSessions);
            });
        }
    });
}

// --- Expose function needed by popup.js --- 
window.fetchAndDisplaySessions = fetchAndDisplaySessions;
window.renderSessions = renderSessions; // Expose renderSessions
