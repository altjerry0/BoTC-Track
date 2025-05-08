**Current Version (local):** `1.0.6` | **Chrome Web Store Version:** `1.0.1` Pending `1.0.4`
***

# BotC Player Tracker Chrome Extension

This Chrome extension tracks and rates players in Blood on the Clocktower (BotC) games, helping you recognize familiar players across sessions and track username changes.

⚠️ **Important: Back Up Your Player Data!** ⚠️

Your player ratings, notes, and history are stored locally by this extension. If you uninstall the extension, this data will be **permanently deleted** by Chrome.

🛡️ **To keep your data safe or transfer it to another computer:**

*   **ALWAYS use the "Export Players (CSV)" button** (found in the "Manage Users" tab) to save your data to a file **before** uninstalling or if you want a backup.
*   You can use the "Import Players (CSV)" button to restore your data from a previously saved CSV file.

Regularly exporting your data is a good habit!

## Table of Contents

- [Installation](#installation)
- [Usage Guidelines](#usage-guidelines)
- [Features](#features)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Known Issues](#current-status--known-issues)
- [Contributing](#contributing)
- [Project Structure](#project-structure)
- [Developer Setup / Loading from Source](#developer-setup--loading-from-source)
- [Release Workflow](#release-workflow)

## Installation

The easiest way to install the BotC Player Tracker is by using the latest release ZIP file.

1.  **Download the latest release:**
    *   Go to the [Releases page](https://github.com/altjerry0/BoTC-Track/releases)
    *   Download the `botc-tracker-vX.Y.Z.zip` file from the latest release.
2.  **Unzip the file:** Extract the contents of the downloaded ZIP file to a folder on your computer. You should see a folder named `botc-extension` (or similar, containing `manifest.json`).
3.  **Load into Chrome:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable **Developer mode** by toggling the switch in the top right corner.
    *   Click on **Load unpacked**.
    *   Select the folder you unzipped in step 2 (the one containing `manifest.json`).
4.  The extension should now be loaded and ready to use! Pin it to your toolbar for easy access.

(For developers looking to load from source, see the [Developer Setup / Loading from Source](#developer-setup--loading-from-source) section below.)

## Features

- **Session Tracking**: View active BotC game sessions and their details
- **Player Rating**: Rate players on a 1-5 scale and add notes
- **Username History**: Track username changes with timestamps
- **Player Analysis**: See indicators of good/bad players in each session
- **Player Search**: Search through current and historical usernames
- **Game Info**: View game edition information (official/custom scripts)
- **Storyteller Highlights**: Easily identify game storytellers
- **Import/Export**: Save and load player data via CSV files.
- **Online Favorites Display**: Lists favorite players who are currently active in any of the fetched game sessions, along with a count. (Recently fixed and improved)
- **Improved Session Tracking**: Enhanced session tracking to use session names as unique identifiers and centralized history updates.
- **General Bug Fixes**: Version 1.0.6 includes numerous fixes to improve stability, user experience, and data accuracy.

## Screenshots

Here's a glimpse of the extension in action:

**Sessions Tab:**
![Sessions Tab Screenshot](docs/botcrater-1.PNG)

**Manage Users Tab:**
![Manage Users Tab Screenshot](docs/botcrater-2.PNG)

**Username History:**
![Username History](docs/botcrater-3.PNG)

## Project Structure

```
botcraterdev
├── .github
│   └── workflows
│       └── release.yml      # GitHub Actions workflow for release packaging
├── botc-extension
│   ├── src
│   │   ├── background.js        # Background service worker
│   │   └── popup
│   │       ├── popup.html       # HTML structure for the popup interface
│   │       ├── popup.js         # Main JavaScript logic for the popup
│   │       ├── popup.css        # Styles for the popup interface
│   │       ├── userManager.js   # Module for user data management (CRUD, history, search)
│   │       └── sessionManager.js # Module for fetching and displaying session data
│   ├── manifest.json            # Extension configuration
│   ├── rules.json               # DeclarativeNetRequest rules
│   ├── samplesessions.json      # Sample session data (for testing/dev)
│   └── README.md                # This file (project documentation)
├── .gitignore
├── .gitattributes 
└── README.md                # Main project README (this file)
```

## Code Organization

The codebase is organized into modular components:

- **User Management**: Handles player data, ratings, and username history tracking
- **Session Management**: Processes session data and displays active games
- **UI Components**: Creates dynamic interface elements for sessions and players

## Usage Guidelines

1. **View Active Sessions**:
   - Navigate to botc.app
   - Click the extension icon to open the popup
   - Click "Fetch Active Games" on the "Sessions" tab.

2. **Manage Players**:
   - Click the "Manage Users" tab.
   - View the list of known players.
   - Use the search field to filter players by current/previous usernames, notes, or score.
   - Click the edit icon (pencil) to update a player's score or notes.
   - Click the delete icon (trash can) to remove a player.
   - Click the star icon to toggle a player's favorite status.

3. **Add/Update Players**:
   - **From Session**: In the "Sessions" tab, expand a session's player list and click "Add Player".
   - **Manually**: In the "Manage Users" tab, click "Add Player Manually" and provide ID, name, score, and notes.

4. **View Username History**:
   - In the "Manage Users" tab, click on the history icon (clock) next to a player's name (if available).

5. **Import/Export Data**:
   - In the "Manage Users" tab, use the "Export Players (CSV)" and "Import Players (CSV)" buttons.

## Future Improvements

- **Security**: Better token storage and expiration handling
- **Error Handling**: Improved retry logic and error boundaries
- **Performance**: Replace polling with an event-based system
- **Code Organization**: Further modularization and TypeScript integration
- **UX Improvements**: Loading states and user feedback
- **Testing**: Unit and integration tests

## Current Status & Known Issues

Several features are currently under development or require fixes:

*   **Unique Session Tracking:** The logic to track the number of unique game sessions a player has participated in is incomplete and does not function correctly.
*   **Favorite User Filtering:** The feature to filter the user list to show only favorited players needs to be implemented or fixed.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## Developer Setup / Loading from Source

These instructions are for developers or users who want to load the extension directly from the source code instead of using a release ZIP.

1. **Clone the repository** or download the project files.
2. **Open Chrome** and navigate to `chrome://extensions/`.
3. Enable **Developer mode** by toggling the switch in the top right corner.
4. Click on **Load unpacked** and select the `botc-extension` directory (located inside the `botcraterdev` project root).
5. The extension should now be loaded and ready for use.

## Release Workflow

This project uses GitHub Actions to automate the creation of release ZIP files.

1.  **Update Version**: Before creating a release, update the `"version"` in `botc-extension/manifest.json`.
2.  **Commit Changes**: Commit the updated `manifest.json` and any other code changes for the release.
    ```bash
    git add botc-extension/manifest.json
    git commit -m "Prepare release vX.Y.Z"
    git push
    ```
3.  **Tag the Release**: Create and push a Git tag matching the version (e.g., `vX.Y.Z`). This will trigger the GitHub Action.
    ```bash
    git tag vX.Y.Z
    git push origin vX.Y.Z
    ```
session-tracking
4.  **Download ZIP**: The workflow will create a GitHub Release and attach the packaged `botc-tracker-X.Y.Z.zip` file to it. This ZIP is ready for upload to the Chrome Web Store.

### Recent Fixes & Improvements

*   **Resolved `updateOnlineFavoritesList` Error**: Fixed a `ReferenceError` related to updating the display of online favorite players. The feature now correctly shows a list and count of favorited players active in fetched sessions within the 'Sessions' tab.
*   **Session Tracking Logic**: Refined session tracking to use session names as unique identifiers and centralized history updates in `checkHistoryAndRender`.
*   **Background `userId` Processing**: Enhanced `background.js` to update `lastSeenTimestamp`, `sessionHistory`, and `uniqueSessionCount` for known players identified via WebSocket messages, and to save these changes to storage.
*   **No Message Handler for `fetchSessions`**: Resolved an error where the popup could not receive session data due to a missing message handler in `background.js`. The handler now correctly fetches data and uses `sendResponse` asynchronously.
*   **Invalid OAuth2 Client ID in `getAuthToken`**: Modified `background.js` to prevent errors by removing a direct call to `chrome.identity.getAuthToken` when `oauth2` client details are not in `manifest.json`, relying instead on passively captured tokens.
*   **Online Favorites List**: You can now easily see which of your favorite players are currently online and in what session, right from the 'Active Games' tab.
*   **Session Tracking Reliability**: Fixed issues with `uniqueSessionCount` and `sessionHistory` to ensure they are accurately tracked and persist correctly across browser sessions.
*   **UI & DOM Stability**: Resolved several bugs related to UI elements not being found or being inadvertently cleared, particularly around the session results and online favorites display.
*   **Data Initialization**: Corrected errors in player data initialization, such as the `isFavorite` status and session history fields, preventing unexpected behavior when adding new players or processing existing ones.
*   **Reduced Console Noise**: Removed many debug messages for a cleaner console.
