<!--
This CHANGELOG.md was last updated by Cascade on 2025-05-23.
-->

# BotC Player Tracker Extension - Changelog
---
## [v1.1.10] - 2025-05-23
### Fixed
- Fixed an issue where the extension failed to detect if the user was part of a live game session. This was due to incorrect parsing of the `botc.app` JWT and a function scope problem that caused an older parsing logic to be used. The JWT is now correctly parsed for the player's game ID, ensuring accurate detection.
- Fixed a critical issue where the User Management tab would fail to load when the extension had an invalid auth token. Previously, the user list depended on successful session fetching, which required a valid token. Now, the User Management functionality works independently of session data, ensuring users can still view and manage their player database even with API errors.

### Added


### Changed



## [v1.1.9] - 2025-05-21
### Fixed
- Player export (CSV) now always uses the latest player data from storage at the time of export, preventing stale or out-of-date exports. This ensures any changes made to player data after popup load are accurately reflected in the exported file.

### Added
- Advanced score-based filtering in User Management search. You can now use queries like `score > 2`, `score <= 4`, `score = 3`, etc., and combine with text search (e.g. `score >= 2 Alice`).
- The extension version is now displayed at the bottom of the Account tab for easy reference.
- Added Brave support for the extension.

### Changed
- **Default Theme**: Dark mode is now the default theme for the extension. Users can still toggle to light mode.
- **Player Notes Display**: Long, unbroken player notes (e.g., 'AAAAA...') in the User Management tab now correctly wrap within the player card. Previously, such notes could overflow their container.

## [v1.1.8] - 2025-05-21
### Fixed
- **Current Game Detection**: Resolved an issue where the extension failed to detect if the user was part of a live game session. This was due to incorrect parsing of the `botc.app` JWT and a function scope problem that caused an older parsing logic to be used. The JWT is now correctly parsed for the player's game ID, ensuring accurate detection.
- **Favorite Player Highlighting**: Ensured that players marked as 'favorite' are now correctly highlighted with a distinct style (e.g., gold border) within the player lists of active game sessions on the 'Sessions' tab. This restores a previously broken visual cue.
- **Targeted UI Refresh for Session Player Updates**: When adding or updating player details (score, notes) from the modal within a session player card, the UI now performs a more targeted refresh. Only the specific player card being edited is re-rendered directly, and other dependent views (Online Favorites, User Management list if active) are updated without causing a full flash or collapse of the main Sessions list. This provides a smoother user experience.
- **Live UI Updates for Player Management**: Significantly enhanced the responsiveness of the UI when managing players. Adding, editing, deleting, or changing the favorite status of a player now triggers an immediate and comprehensive refresh of all relevant views, including the 'Known Players' list, 'Online Favorites', and player details within active sessions. This ensures data consistency across the extension without requiring manual refreshes.
    - Implemented a centralized `refreshAllViews` function in `popup.js` to handle UI updates holistically.
    - Integrated `refreshAllViews` into the `toggleFavoriteStatus` function in `userManager.js`.
    - Updated the "Add Player", "Edit Player", and "Delete Player" workflows to utilize the new refresh mechanism, providing a seamless user experience.

### Changed
- **Default Theme**: Dark mode is now the default theme for the extension. Users can still toggle to light mode.
- **Player Notes Display**: Long, unbroken player notes (e.g., 'AAAAA...') in the User Management tab now correctly wrap within the player card. Previously, such notes could overflow their container.

## [v1.1.7] - 2025-05-20
### Fixed
- **Chrome Web Store Compliance:** Eliminated external script loading to comply with Chrome Web Store policies:
  - Implemented a secure external authentication service at auth.trackbotc.com
  - Used Chrome Identity API for Google authentication without external scripts
  - Created a token exchange system for secure Firebase authentication
  - Maintained proper security with Firebase custom tokens
  - Preserved compatibility with existing Firestore data and security rules
  - Ensured proper data isolation between users
  - Retained all cloud sync functionality while ensuring full compliance

### Changed
- **Authentication System:** Refactored to use a more secure hybrid approach:
  - Chrome Identity API handles Google authentication (no external scripts)
  - Custom auth service at auth.trackbotc.com manages token exchange
  - Secure Firebase authentication with custom tokens
- **Documentation:**
  - Updated root `README.md` to reflect current features, including cloud sync, the new authentication model, and updated screenshots.
  - Consolidated authentication service documentation by merging `docs/auth-service.md` into `firebase-auth-service/README.md`.
  - Cleaned up `TODO.md` to focus on current bugs and future features.

### Added
- **Shared Player Lists (Teams/Groups via Firebase)**: Implemented functionality for users to share player lists. *(Marked as complete based on TODO update)*

### Fixed
- **Online Player Detection:** Fixed issues with online player tracking:
  - Improved session data processing to correctly identify online players
  - Fixed online count display in favorites list
  - Ensured proper boolean handling of online status
  - Removed debug logging for cleaner production code
  - Firebase Anonymous Auth provides compatible UIDs for Firestore rules (no reCAPTCHA)
  - User profiles store both Firebase UID and Google ID for cross-reference
  - Updated all message handlers to work with the new hybrid authentication system
  - Improved session persistence with enhanced token management

### Security
- Enhanced the authentication security model to maintain Firestore rules while avoiding external scripts
- Implemented proper auth token revocation on logout
- Improved user profile data management with better structured document model


## [v1.1.6] - 2025-05-18
**PRODUCTION CLIENT ID USE 1.1.5a FOR DEVELOPMENT MODE**
### Added
- **Enhanced Role Distinction:** Improved the distinction between active players and spectators:
  - Added clear role badges for all users (Player, Storyteller, Spectator)
  - Fixed logic to properly identify users who are in the session but not actually playing
  - Active players now have a green badge labeled "Player"
  - Spectators have a gray badge labeled "Spec"
  - Storytellers have a purple badge labeled "ST"
- **Multiple Role Support:** Enhanced role detection to properly identify and display multiple storytellers and spectators in the session list.
- **Visual Role Indicators:** Added distinct styling for different player roles:
  - Active Players: Green left border
  - Storytellers: Indigo left border with "Storyteller" label
  - Spectators: Gray left border with "Spectator" label
- **Firebase and Cloud Sync Infrastructure:**
  - Added npm and Webpack build system for proper module bundling
  - Integrated Firebase SDK (v9 modular format) for cloud services
  - Set up Firestore database structure for player data storage
  - Created build pipeline for Manifest V3 compatibility

### Changed
- **Code Cleanup:** Removed the content script functionality (play_page_observer.js) since private games can now be detected through the standard API.
- **Reduced Permissions:** Removed unnecessary content script permissions from the manifest file.
- **Console Log Cleanup:** Removed debug console.log statements throughout the codebase for cleaner browser console output.

### Fixed
- **Firebase Player Deletion:** Fixed an issue where deleted players weren't being properly removed from Firestore when pushing local changes to the cloud.
- **API Token Management:** Enhanced the auth token capture system to prevent 403 errors by actively tracking and refreshing tokens from both the BotC website and its chat service.
- **Current Game Detection:** Fixed the functionality for detecting and highlighting the current game in the session list. The popup now properly requests game information from the background script when opened, enabling the highlighting of private game sessions where the user is participating.
- **Duplicate Variable Declaration:** Fixed a bug where the `isStoryteller` variable was being declared twice in the `createPlayerCard` function, causing a syntax error.
- **Function Availability:** Improved script loading sequence to ensure the `fetchAndDisplaySessions` function is always available, preventing errors when refreshing the session list.
- **Module Loading:** Fixed "Cannot use import statement outside a module" error in auth.js by adding the `type="module"` attribute to the script tag in auth.html, allowing proper ES module importing.
- **OAuth2 Authentication:** Fixed "Invalid OAuth2 Client ID" error by adding the required `oauth2` section to manifest.json with the correct client ID and scopes for Chrome identity API.
- **User Management Functionality:**
  - Fixed "Add Player" button on the User Management page which previously displayed "Player not found" error
  - Enhanced player ID validation for new players with clear guidance on proper format
  - Improved error messages for invalid inputs when adding or editing players

### Changed
- **Code Cleanup:** Removed the content script functionality (play_page_observer.js) since private games can now be detected through the standard API.
- **Reduced Permissions:** Removed unnecessary content script permissions from the manifest file.
- **Console Log Cleanup:** Removed debug console.log statements throughout the codebase for cleaner browser console output.
- **Development Workflow:**
  - Updated build process to use `npx webpack --mode=production`
  - Improved documentation for developer setup and first-time build
  - Added bundling support to ensure proper code organization

### Technical
- Updated project structure to support modern JavaScript bundling
- Added Firebase configuration for anonymous authentication
- Implemented Firestore database connectivity for future sync features
- Added rate limiting for database operations to prevent API abuse
- Enhanced sync status messaging with clear visual feedback
- **Major Refactoring of Player Data Management:**
    - `userManager.js` is now the definitive source of truth for all player data.
        - Implemented a robust in-memory cache (`allPlayerData`) within `userManager.js` to ensure data consistency and improve performance.
        - All player data modifications (add, edit, delete, history updates) and persistence to `chrome.storage.local` are now exclusively handled by `userManager.js`.
        - Exposed a comprehensive `window.userManager` API (e.g., `getAllPlayerData`, `savePlayerData`, `addPlayer`, `updateUsernameHistoryIfNeeded`, `updateSessionHistoryIfNeeded`) for other modules to interact with player data in a controlled manner.
    - `sessionManager.js` refactored:
        - Now exclusively uses the `window.userManager` API to fetch initial player data and to trigger updates to player username and session histories.
        - Removed all direct `chrome.storage.local.get` and `chrome.storage.local.set` calls related to `playerData`, eliminating previous data conflicts and race conditions.
    - `popup.js` refactored:
        - Initializes its `window.playerData` by calling `window.userManager.getAllPlayerData()`.
        - All UI-driven player actions (e.g., adding a new player, clearing all player data, rendering the user management tab) now correctly call functions exposed on `window.userManager`.
        - Ensured that functions like `addPlayer` and `createUsernameHistoryModal` passed to `sessionManager.js` are correctly sourced from `window.userManager`.
- Streamlined the data flow for player information across `popup.js`, `userManager.js`, and `sessionManager.js`, significantly improving data integrity and reducing the likelihood of stale or inconsistent data.

- Corrected an issue where updating a player's score or notes from the session list modal (in 'Active Games' tab) would cause their name to be lost and replaced with a generic "Player [id]" format. The modal's save action in `sessionManager.js` now correctly calls `userManager.addPlayer` with the player's current username, preserving their name and favorite status.

## [v1.1.3a] - 2025-05-12

### Fixed
- Corrected an issue where editing a player's details in the 'Manage Users' tab would incorrectly mark them as a favorite.
- Refactored player data loading and saving (`loadPlayerData`, `savePlayerData`, and related functions) to use Promises and `async/await`, resolving issues where the UI wouldn't refresh correctly after changes without manual reloads.
- Fixed a bug where the 'Manage Users' tab would appear blank after the async refactor due to incorrect function calls.
- Restored the 'Online' status indicator for players in the 'Manage Users' tab, ensuring it correctly reflects players currently in active game sessions.
- Fixed the search functionality within the 'Manage Users' tab.
- Session list filters ('Official Only', 'Hide Completed') now update the displayed list dynamically without requiring a full data re-fetch.
- Corrected the display name for the official script 'Bad Moon Rising' (was previously misspelled 'Blood Moon Rising').
- Fixed the 'Export Players (CSV)' button functionality by correcting the function name called in its event listener.
- Fixed the 'Import Players (CSV)' functionality by correctly handling the asynchronous nature of saving imported data, ensuring the UI updates after the import is complete.

## [v1.1.2] - 2025-05-12

### Fixed
- Resolved `chrome.runtime.lastError: The message port closed before a response was received` by improving asynchronous handling and `sendResponse` calls in the background script's message listener for session fetching.
- Fixed `TypeError: updateOnlineFavoritesListFunc not found` by correctly exposing the function from `popup.js` to `sessionManager.js` via the `window` object.
- Addressed `TypeError: Cannot read properties of null (reading 'style')` (and related `getElementById` returning `null` issues) by resolving conflicts related to multiple script executions or DOM access timing within `popup.js`, ensuring reliable UI element initialization.

### Added
- **Enhanced Session Highlighting:**
  - Sessions in the popup list are now highlighted with a distinct blue glow if they match the game currently open in the active `botc.app/play` tab (based on storyteller ID match from live game data).
  - Sessions where the logged-in user is a participant (based on backend session data) continue to be highlighted with an orange glow.
  - If a session meets both criteria (current tab's game AND user is a participant), it will display a combined visual highlight (blue outer glow with an orange inner glow).
  - Added corresponding CSS variables for these highlights, including theme-appropriate adjustments for dark mode.

### Changed
- **UI Enhancements - Session View:**
    - Replaced the "Add Player" text button on player cards within sessions with an SVG icon for a cleaner interface.
    - Changed the "Show players" and "Hide players" text for session player lists to ▼ and ▲ arrow icons respectively, providing a more intuitive expand/collapse experience.
- **UI Enhancements - User Management & General:**
    - Normalized the appearance and size of action buttons (Favorite, Edit, History, Refresh Username, Delete) in the 'Known Players' list for better visual consistency.
    - Ensured the "Add Player Manually" button aligns with the updated button styling.
    - These buttons now use standard button styling, with icons spaced appropriately from text.
    - The 'Clear All Player Data' button is now positioned to the far right of the control bar.
    - Reduced margins between other buttons in the user management control bar for a more compact layout.
    - Standardized button styles across the extension, removing custom styles in favor of a base button appearance and specific icon-button styles.
    - Improved icon centering within dedicated icon-only action buttons (e.g., Edit, Delete).

### Fixed
- **ModalManager**: Resolved an issue where the `showAlert` method was not defined in the `ModalManager` object, causing errors when called from other files. Added the missing method.

### Refactored
- **Codebase Cleanup**: Removed unused JavaScript functions and CSS classes across multiple files (`background.js`, `popup.js`, `userManager.js`, `sessionManager.js`, `popup.css`) to improve code maintainability and reduce bundle size. This includes:
  - Removed dead code related to an unused 'storeAuthToken' message handler.
  - Eliminated redundant or shadowed function definitions (e.g., `updateUsernameHistory`).
  - Removed uncalled functions previously intended for player search (`searchPlayers`, `displaySearchResults`), inline username history toggling (`toggleUsernameHistory`), session player analysis (`analyzeSessionPlayers`), and specific storyteller info gathering (`getStorytellerInfo`).
  - Consolidated duplicated `getRatingClass` utility function into a single, more robust version.
  - Removed CSS styles associated with the removed player analysis indicators.
- **CSV Module Separation**: Separated CSV import/export logic from `userManager.js` into a new dedicated `src/popup/csvManager.js` module for better modularity and code clarity.

## [v1.1.0] - 2025-05-09

### Added
- **Refresh Player Name**: Added a button ('🔄') to each player card in the 'Manage Users' tab to fetch and update the player's username directly from `botc.app`. This helps keep local player names synchronized with their current official usernames. If a name change is detected, the old name is added to the player's username history.

### Changed
- **Online Status Accuracy**: The 'Manage Users' tab now accurately reflects a player's online status (including storytellers and spectators) by checking `session.usersAll` from fetched game data. This ensures all users present in a session are shown with an online indicator and their current game session.

### Refactored

## [v1.0.9] - 2025-05-08

### Added
- N/A

### Changed
- **UI & Styling**: Enhanced dark mode styling for modals, session content, and player cards, ensuring better visibility and consistency throughout the extension.
- **Player Card Ratings**: Updated player card rating display to use distinct left-border colors for ratings 1 through 5 (5: Green, 4: Blue, 3: Orange, 2: Light Red, 1: Dark Red). This replaces full background changes for ratings, improving visual clarity in both light and dark themes.
- Refined CSS for player cards to ensure rating border colors are correctly displayed, particularly addressing previous issues in dark mode.
- **Player Status Clarity**: Improved the player status display in the 'Manage Users' tab:
  - Players not in an active game session but recently active on `botc.app` (within the last 2 minutes) will now show status as "Not in game (Active: [time since last seen])" instead of just "Offline".
  - The green visual 'online-badge' is retained next to the names of players who are actively in a game session.

### Fixed
- Resolved CSS specificity issues that previously caused rating indicators (now border colors) to be incorrectly displayed or hidden in dark mode.

### Removed
- N/A

## [v1.0.8] - 2025-05-08

### Added
- **Background Session Data Sync**: The extension now periodically fetches session data from `botc.app` in the background (approximately every 2 minutes) when a valid authorization token is present. This updates the `lastSeenTimestamp`, `lastSeenSessionId`, and `sessionHistory` for known players, ensuring player activity is kept more current even when the popup is not open. This utilizes the `chrome.alarms` API and requires the "alarms" permission.
- Background session fetching now processes `session.usersAll` to capture activity for all users in a session, not just seated players.
- Background session fetching now detects and updates player username changes, storing the previous username in history.

### Changed
- The 'Online Favorites' list now starts collapsed by default to provide a cleaner initial view and save screen space.
- Removed extensive debug `console.log` statements from `popup.js`, `sessionManager.js`, and `userManager.js` for a cleaner browser console output during regular use.
- Refined loading messages (e.g., "Fetching sessions...") and indicator visibility in `popup.js` for better user experience during data fetching and filter application.
- The `renderSessions` function in `sessionManager.js` is now exposed on the `window` object, allowing it to be called directly by `popup.js` for operations like re-rendering sessions after a filter change.
- Background session fetch alarm interval set to 1 minute.
- Refined and reduced verbosity of console logging for the background fetching process to focus on key events and errors.
- Improved styling for the username history modal to ensure readability in light mode (non-dark mode).

### Fixed
- Resolved a `ReferenceError` for `updateOnlineFavoritesList` in `sessionManager.js` by ensuring the function was correctly defined in `popup.js` and passed as a parameter through `fetchAndDisplaySessions` and `checkHistoryAndRender`.
- Corrected a DOM manipulation issue where the 'Online Favorites' section (`onlineFavoritesSection`) was being cleared when new session results were loaded. This was fixed by moving the section out of the `sessionResultsDiv` in `popup.html` and refining `popup.js` to target a specific `sessionListDiv` for rendering session cards.
- Addressed a bug where `onlineFavoritesList` DIV or `onlineFavoritesCount` SPAN could not be found if `sessionResultsDiv` was cleared before these elements were accessed; HTML restructuring and targeted JS updates resolved this.
- Fixed a `ReferenceError: Cannot access 'isFavorite' before initialization` in the `addPlayer` function within `userManager.js`. The logic for determining and applying the `isFavorite` status for new and existing players has been corrected.
- Ensured that `sessionHistory` (as an array) and `uniqueSessionCount` are correctly initialized for newly added players and for existing player data that might have been missing these fields. This prevents the session count from resetting incorrectly.
- Ensured username changes are detected and processed by the background sync.
- Corrected an issue where the username history modal could be transparent and unreadable in light mode.

## [v1.0.7] - 2025-05-08

### Added
- **Display "Last Seen Time"**: Shows a human-readable "time ago" (e.g., "5 minutes ago", "2 days ago") for offline players in the "Manage Users" tab, utilizing the `lastSeenTimestamp` player data property. This enhances visibility into player recent activity.
- **Manual Dark Mode Toggle**: Implemented a toggle switch in the popup header to manually enable/disable dark mode. This replaces reliance on system settings for dark mode preference. (Note: Further styling refinements for dark mode are ongoing).
- **Enhanced Player Search**: User search in the 'Manage Users' tab now also matches against Player IDs, in addition to name, notes, and score.

### Fixed
- **CSV Import/Export Reliability**: Significantly improved the reliability of CSV data import. Implemented a robust CSV parsing function (`parseCsvRow`) to correctly handle complex data fields, particularly `sessionHistory` and `usernameHistory` (which are stored as JSON strings), preventing data corruption and parsing errors previously encountered.
- **Dark Mode Styling**: Corrected CSS variable scoping and related styles to ensure proper application of dark mode, fixing issues with page background and text readability on player cards.

## [v1.0.6] - 2025-05-08

### Added
- **Online Favorites Display**: Added a collapsible section at the top of the 'Active Games' tab that lists favorited players currently active in fetched game sessions. Includes a count of online favorites.
- **Improved Session Tracking Persistence**: `uniqueSessionCount` and `sessionHistory` (an array of session IDs) are now robustly managed. Player objects correctly initialize these fields, and updates persist correctly across browser restarts and extension updates.

### Fixed
- Resolved a `ReferenceError` for `updateOnlineFavoritesList` in `sessionManager.js` by ensuring the function was correctly defined in `popup.js` and passed as a parameter through `fetchAndDisplaySessions` and `checkHistoryAndRender`.
- Corrected a DOM manipulation issue where the 'Online Favorites' section (`onlineFavoritesSection`) was being cleared when new session results were loaded. This was fixed by moving the section out of the `sessionResultsDiv` in `popup.html` and refining `popup.js` to target a specific `sessionListDiv` for rendering session cards.
- Addressed a bug where `onlineFavoritesList` DIV or `onlineFavoritesCount` SPAN could not be found if `sessionResultsDiv` was cleared before these elements were accessed; HTML restructuring and targeted JS updates resolved this.
- Fixed a `ReferenceError: Cannot access 'isFavorite' before initialization` in the `addPlayer` function within `userManager.js`. The logic for determining and applying the `isFavorite` status for new and existing players has been corrected.
- Ensured that `sessionHistory` (as an array) and `uniqueSessionCount` are correctly initialized for newly added players and for existing player data that might have been missing these fields. This prevents the session count from resetting incorrectly.

### Changed
- The 'Online Favorites' list now starts collapsed by default to provide a cleaner initial view and save screen space.
- Removed extensive debug `console.log` statements from `popup.js`, `sessionManager.js`, and `userManager.js` for a cleaner browser console output during regular use.
- Refined loading messages (e.g., "Fetching sessions...") and indicator visibility in `popup.js` for better user experience during data fetching and filter application.
- The `renderSessions` function in `sessionManager.js` is now exposed on the `window` object, allowing it to be called directly by `popup.js` for operations like re-rendering sessions after a filter change.

---

## [v1.0.5] - 2025-05-08

### Added
- **Online Favorites Display**: Added a collapsible section at the top of the 'Active Games' tab that lists favorited players currently active in fetched game sessions. Includes a count of online favorites.
- **Improved Session Tracking Persistence**: `uniqueSessionCount` and `sessionHistory` (an array of session IDs) are now robustly managed. Player objects correctly initialize these fields, and updates persist correctly across browser restarts and extension updates.

### Fixed
- Resolved a `ReferenceError` for `updateOnlineFavoritesList` in `sessionManager.js` by ensuring the function was correctly defined in `popup.js` and passed as a parameter through `fetchAndDisplaySessions` and `checkHistoryAndRender`.
- Corrected a DOM manipulation issue where the 'Online Favorites' section (`onlineFavoritesSection`) was being cleared when new session results were loaded. This was fixed by moving the section out of the `sessionResultsDiv` in `popup.html` and refining `popup.js` to target a specific `sessionListDiv` for rendering session cards.
- Addressed a bug where `onlineFavoritesList` DIV or `onlineFavoritesCount` SPAN could not be found if `sessionResultsDiv` was cleared before these elements were accessed; HTML restructuring and targeted JS updates resolved this.
- Fixed a `ReferenceError: Cannot access 'isFavorite' before initialization` in the `addPlayer` function within `userManager.js`. The logic for determining and applying the `isFavorite` status for new and existing players has been corrected.
- Ensured that `sessionHistory` (as an array) and `uniqueSessionCount` are correctly initialized for newly added players and for existing player data that might have been missing these fields. This prevents the session count from resetting incorrectly.

### Changed
- The 'Online Favorites' list now starts collapsed by default to provide a cleaner initial view and save screen space.
- Removed extensive debug `console.log` statements from `popup.js`, `sessionManager.js`, and `userManager.js` for a cleaner browser console output during regular use.
- Refined loading messages (e.g., "Fetching sessions...") and indicator visibility in `popup.js` for better user experience during data fetching and filter application.
- The `renderSessions` function in `sessionManager.js` is now exposed on the `window` object, allowing it to be called directly by `popup.js` for operations like re-rendering sessions after a filter change.

---

## [v1.0.4] - 2025-May-08

### Fixed
- Corrected username history modal to properly display names from history entries using the `username` key, resolving the 'Unknown Change' bug.
- Eliminated "Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist." console errors by removing a superfluous `chrome.tabs.onUpdated` listener in `background.js`.

### Changed
- Aligned the extension title and the "Open in Tab" button on the same row in the popup interface for improved layout.

---

## [v1.0.2] - 2024-04-18

### Added
- **TODO.md**: Created `TODO.md` to track future development tasks.
- **README Updates**: `README.md` now references `TODO.md` and lists 'Time Since Last Seen' and 'Unique Session Count' as planned features.

### Changed
- Minor text updates in `README.md`.

---

## [v1.0.1] - 2024-04-11

### Added
- **Initial Release on GitHub**.
- **Core Player Tracking**: Fetch active games, add/manage players, rate players, take notes.
- **CSV Import/Export**.
- **Session Filtering** (Official Only).
- **Basic UI** for popup.

### Changed
- **Manifest v3 Compliance Checks**: Removed unused `activeTab` permission and `web_accessible_resources` for scripts loaded by `popup.html`.
- Removed dead code (`content.js`).

### Fixed
- Corrected various initial setup issues and minor bugs.

---

## [v1.0.0] - 2024-03-10

### Added
- Initial release of the BotC Player Tracker extension.
- **Core Player Tracking**: Fetch active games, add/manage players, rate players, take notes.
- **CSV Import/Export**.
- **Session Filtering** (Official Only).
- **Basic UI** for popup.

### Changed
- **Manifest v3 Compliance Checks**: Removed unused `activeTab` permission and `web_accessible_resources` for scripts loaded by `popup.html`.
- Removed dead code (`content.js`).

### Fixed
- Corrected various initial setup issues and minor bugs.

---

## [v1.1.10] - 2025-05-21
### Fixed
- User Management: Correctly display 'Last seen: Never' for players with no valid last seen timestamp, instead of a far-past date.

## [v1.1.11] - 2025-05-21
### Fixed
- Popup Script: Resolved a `ReferenceError: error is not defined` in `popup.js` by ensuring the `fetchAndDisplaySessions` callback consistently handles an error parameter.
- CSV Export: Prevented `csvManager.js` warning "Export called with no data" by adding a check in `popup.js` to ensure player data exists before attempting to export. Users are now alerted if there's no data to export.
