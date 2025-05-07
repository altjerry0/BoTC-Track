# BotC Player Tracker Chrome Extension

This Chrome extension tracks and rates players in Blood on the Clocktower (BotC) games, helping you recognize familiar players across sessions and track username changes.

## Features

- **Session Tracking**: View active BotC game sessions and their details
- **Player Rating**: Rate players on a 1-5 scale and add notes
- **Username History**: Track username changes with timestamps
- **Player Analysis**: See indicators of good/bad players in each session
- **Player Search**: Search through current and historical usernames
- **Game Info**: View game edition information (official/custom scripts)
- **Storyteller Highlights**: Easily identify game storytellers
- **Import/Export**: Save and load player data via CSV files.

## Project Structure

```
chrome-extension-project
├── src
│   ├── background.js        # Background service worker
│   ├── content.js           # Content script interacting with botc.app pages
│   └── popup
│       ├── popup.html       # HTML structure for the popup interface
│       ├── popup.js         # Main JavaScript logic for the popup
│       ├── popup.css        # Styles for the popup interface
│       ├── userManager.js   # Module for user data management (CRUD, history, search)
│       └── sessionManager.js # Module for fetching and displaying session data
├── manifest.json            # Extension configuration
├── rules.json               # DeclarativeNetRequest rules
├── samplesessions.json      # Sample session data (for testing/dev)
└── README.md                # Project documentation
```

## Code Organization

The codebase is organized into modular components:

- **User Management**: Handles player data, ratings, and username history tracking
- **Session Management**: Processes session data and displays active games
- **UI Components**: Creates dynamic interface elements for sessions and players

## Setup Instructions

1. **Clone the repository** or download the project files.
2. **Open Chrome** and navigate to `chrome://extensions/`.
3. Enable **Developer mode** by toggling the switch in the top right corner.
4. Click on **Load unpacked** and select the `chrome-extension-project` directory.
5. The extension should now be loaded and ready for use.

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

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## Current Status & Known Issues

Several features are currently under development or require fixes:

*   **Unique Session Tracking:** The logic to track the number of unique game sessions a player has participated in is incomplete and does not function correctly.
*   **Favorite User Filtering:** The feature to filter the user list to show only favorited players needs to be implemented or fixed.