# BotC Player Tracker - TODO List

This file tracks planned features and improvements for the BotC Player Tracker extension.

## Features to Implement

- [x] ~~Implement "Time Since Last Seen" for Players~~ (Verified and enhanced in v1.0.7)
  - **Goal**: Display how recently a player was last encountered in a game session.
  - **Current State**: The player data model has a `lastSeenSessionId` field, which is currently not fully utilized to calculate and display this information (often `null`).
  - **Implementation Ideas**:
    - When a player is observed in a session, store a `lastSeenTimestamp` directly on the player object.
    - Alternatively, if session data includes dates, use `lastSeenSessionId` to look up the session date and calculate recency.
    - Update `userManager.js` (e.g., `updateSessionHistoryIfNeeded` or a new function) to record this information.
    - Add a display element in the player list (Manage Users tab) to show this (e.g., "Last seen: X days ago").

- [x] ~~Implement "Unique Session Count" for Players~~ (Completed and made robust in v1.0.5 - uses `sessionHistory` array)
  - **Goal**: Accurately count and display the number of distinct game sessions a player has participated in.
  - **Current State**: The player data model includes `uniqueSessionCount` (often `0`). The logic for incrementing this based on unique session IDs needs to be robustly implemented or restored.
  - **Implementation Ideas**:
    - Review and enhance the `updateSessionHistoryIfNeeded` function in `userManager.js` to correctly identify if a player is joining a session they haven't been in before (based on `currentSessionId` vs stored history or `lastSeenSessionId`).
    - Ensure the player's list of attended session IDs (if maintained) is used or implement a mechanism to track this.
    - Display this count in the player list (Manage Users tab).

## Other Potential Enhancements

- [x] ~~Fix `updateFavorites` function that is currently causing errors.~~ (Resolved by passing function as parameter and implementing UI update in `popup.js`)
- [x] ~~Verify `isFavorite` Flag Persistence and UI~~ (Verified and fixed in v1.0.5)
- [ ] **Investigate Player Not Found**: Debug logs indicate instances where players are not found in player data during session history updates. This may require further investigation into player data management and synchronization, especially with WebSocket updates.
- [ ] **Refine UI for Current Game Players (Post-MVP)**: Once WebSocket interception is stable and core logic is robust, revisit displaying players from the *current* live game in a dedicated UI section in the popup (feature was previously on 'current-game-sockets' branch and removed for MVP focus).
    - Consider how to differentiate these from players in fetched historical/recent sessions.
- [ ] **Refine Dark Mode Styling**: Improve the visual appearance and consistency of dark mode across all extension components.

## Future Enhancements / Ideas

- [ ] **Display Current Game Players via WebSocket Interception (Phase 2 - UI/UX)**
    -   Background processing of WebSocket messages to update player `lastSeenTimestamp` and `sessionHistory` is implemented.
    -   The "Online Favorites Display" feature leverages this by showing active *favorite* players.
    -   Consider if a more general "Players in Your Current Game" list (distinct from favorites) is still desired and how it would integrate with the current UI.
- [ ] **Firebase Integration - Phase 2 (Data Sync)**
    -   Basic authentication UI and setup is in place.
    -   Implement Firestore synchronization for `playerData` in `userManager.js` (`loadPlayerData`, `savePlayerData`).
    -   Define sync strategy (e.g., Firestore as source of truth, merge strategies for conflicts if any).
- [ ] **Advanced Player Search/Filtering in 'Manage Users' Tab**
    - [x] ~~Filter known players list by various criteria.~~ (Basic search covers name, notes, score. Player ID search added in v1.0.7)
    - [ ] Sort by name, rating, last seen, unique sessions.
    - [x] ~~Enhance player search to include Player ID.~~ (Completed in v1.0.7)
- [ ] **UI/UX Refinements**
    - [x] ~~Improve styling of player cards and session lists.~~ (Major dark mode issues resolved in v1.0.7: background, text contrast. Minor tweaks may still be needed.)
    -   Consider more distinct visual cues for official vs. experimental games.
    -   Provide clearer feedback on import/export success/failure.
- [ ] **Review `declarativeNetRequest` Rule**: The current `rules.json` has a broad `allowAllRequests` rule. Investigate if this can be narrowed for better security/privacy, though it might be necessary for `botc.app` interactions if specific subdomains or paths change frequently.

## Bugs / Technical Debt

- [x] ~~Console Output Cleanup: Remove excessive debug `console.log` statements.~~ (Completed in v1.0.5 for popup/manager scripts)
- [ ] **Background Script Console Output Cleanup**: Review and remove any remaining unnecessary debug logs from `background.js`.
- [ ] **Error Handling**: Enhance error handling and user feedback for API request failures or unexpected data formats beyond current console messages.
- [x] ~~**Import/Export Errors**: Fix the errors being presented when exporting and importing.~~ (Resolved in v1.0.7 by implementing robust CSV parsing)
  - [x] ~~Expand export to include more data.~~ (Completed in v1.0.6, all relevant fields included)

## Long Term / Wishlist

- [ ] **Shared Player Lists (Teams/Groups)**: Allow users (perhaps via Firebase) to share curated player lists or notes with a trusted group.
- [ ] **Automated Tagging/Categorization**: Ideas for auto-tagging players based on roles frequently played if that data becomes available.

---
*Mark items with [x] when completed. Add new tasks as they arise.*
