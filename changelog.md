<!--
This CHANGELOG.md was last updated by Cascade on 2025-05-08.
-->

# BotC Player Tracker Extension - Changelog
---

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

## [UNRELEASED]

### Added
- Your new feature here!

### Changed

### Fixed

---
