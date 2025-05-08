# BotC Player Tracker - TODO List

This file tracks planned features and improvements for the BotC Player Tracker extension.

## Features to Implement

- **Implement "Time Since Last Seen" for Players**:
  - **Goal**: Display how recently a player was last encountered in a game session.
  - **Current State**: The player data model has a `lastSeenSessionId` field, which is currently not fully utilized to calculate and display this information (often `null`).
  - **Implementation Ideas**:
    - When a player is observed in a session, store a `lastSeenTimestamp` directly on the player object.
    - Alternatively, if session data includes dates, use `lastSeenSessionId` to look up the session date and calculate recency.
    - Update `userManager.js` (e.g., `updateSessionHistoryIfNeeded` or a new function) to record this information.
    - Add a display element in the player list (Manage Users tab) to show this (e.g., "Last seen: X days ago").

- **Implement "Unique Session Count" for Players**:
  - **Goal**: Accurately count and display the number of distinct game sessions a player has participated in.
  - **Current State**: The player data model includes `uniqueSessionCount` (often `0`). The logic for incrementing this based on unique session IDs needs to be robustly implemented or restored.
  - **Implementation Ideas**:
    - Review and enhance the `updateSessionHistoryIfNeeded` function in `userManager.js` to correctly identify if a player is joining a session they haven't been in before (based on `currentSessionId` vs stored history or `lastSeenSessionId`).
    - Ensure the player's list of attended session IDs (if maintained) is used or implement a mechanism to track this.
    - Display this count in the player list (Manage Users tab).

## Other Potential Enhancements

- [x] ~~Fix `updateFavorites` function that is currently causing errors.~~ (Resolved by passing function as parameter and implementing UI update in `popup.js`)
- [ ] **Investigate Player Not Found**: Debug logs indicate instances where players are not found in player data during session history updates. This may require further investigation into player data management and synchronization, especially with WebSocket updates.
- [ ] **Refine UI for Current Game Players (Post-MVP)**: Once WebSocket interception is stable and core logic is robust, revisit displaying players from the *current* live game in a dedicated UI section in the popup (feature was previously on 'current-game-sockets' branch and removed for MVP focus).
    - Consider how to differentiate these from players in fetched historical/recent sessions.
- [ ] **Verify `isFavorite` Flag Persistence and UI**: Ensure the `isFavorite` flag for players is reliably saved and loaded, and that UI elements (e.g., a toggle/checkbox in player details) correctly reflect and update this status across all player displays (Manage Users tab, session lists, online favorites).

## Future Enhancements / Ideas

- (Add more ideas as they come up)
