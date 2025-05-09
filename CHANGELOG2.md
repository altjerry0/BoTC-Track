<!--
This CHANGELOG.md was last updated by Cascade on 2025-05-09.
-->

# BotC Player Tracker Extension - Changelog
---

## [v1.1.2] - 2025-05-09

### Fixed
- Resolved `chrome.runtime.lastError: The message port closed before a response was received` by improving asynchronous handling and `sendResponse` calls in the background script's message listener for session fetching.
- Fixed `TypeError: updateOnlineFavoritesListFunc not found` by correctly exposing the function from `popup.js` to `sessionManager.js` via the `window` object.
- Addressed `TypeError: Cannot read properties of null (reading 'style')` (and related `getElementById` returning `null` issues) by resolving conflicts related to multiple script executions or DOM access timing within `popup.js`, ensuring reliable UI element initialization.

## [v1.1.1] - 2025-05-09

### Added
- Enhanced user list sorting in 'Manage Users' tab:
  - Online favorite players are now prioritized at the top.
  - Subsequent sorting is by player rating (descending).
  - Offline players are sorted by 'last seen' time (most recent first), then by rating.
- **Dynamic Export Filename**: CSV export filenames now include a `YYYYMMDD` datestamp and the count of users being exported (e.g., `botc_player_data_20250509_12users.csv`).
- **Player Score Indicators**: Added visual indicators (+, ●, -) to session headers in the 'Active Games' tab, showing an aggregate count of good (score 4-5), neutral (score 3), and bad (score 1-2) rated players within each session. Indicators are displayed in the order: good, neutral, bad.

### Changed
- **UI Overhaul: Modal Implementation**:
    - Replaced all native browser `prompt()` and `alert()` popups with a unified, custom modal system (`ModalManager`).
    - Affects player creation, editing, deletion confirmation, score/notes input from session cards, and various notifications (e.g., data export/import status, data clearing).
    - Provides a consistent dark-theme UI and improved user experience for all interactive dialogs.
- **UI Enhancement (User Management Controls):**
    - Updated 'Add Player Manually', 'Export Players (CSV)', and 'Import Players (CSV)' buttons to include text labels ('Add', 'Export', 'Import') next to their icons for improved clarity. (Reverted icon-only design for these specific buttons).
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

## [v1.2.0] - YYYY-MM-DD 

### Changed
- **UI Enhancements - Session View:**
    - Replaced the "Add Player" text button on player cards within sessions with an SVG icon for a cleaner interface.
    - Changed the "Show players" and "Hide players" text for session player lists to ▼ and ▲ arrow icons respectively, providing a more intuitive expand/collapse experience.
- **UI Enhancements - User Management & General:**
    - Normalized the appearance and size of action buttons (Favorite, Edit, History, Refresh Username, Delete) in the 'Known Players' list for better visual consistency.
    - Ensured the "Add Player Manually" button aligns with the updated button styling.
    - Adjusted styling for various buttons to use consistent padding, icon sizing, and hover effects across the extension.
- **Modal Theming**: Updated modal CSS to correctly use theme variables, ensuring proper display in both light and dark modes.
- **Active Session Highlighting**: Sessions where the logged-in user is participating (present in `usersAll`) are now prioritized:
    - These sessions are sorted to appear at the top of the session list.
    - The session card header receives a "glow" effect for visual distinction.
    - This involved updating JWT parsing in `popup.js` (already present), modifying `sessionManager.js` for sorting and class application based on `usersAll`, and updating `popup.css` for the glow effect.

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
