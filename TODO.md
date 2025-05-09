# BotC Player Tracker - TODO List

This file tracks planned features and improvements for the BotC Player Tracker extension.

## Features Under Development

- **WebSocket Game Data Interception (Phase 1 - User ID Collection) - IN PROGRESS**
  - [x] Inject content script into `botc.app`.
  - [x] Intercept and proxy WebSockets for game and chat.
  - [x] Relay messages to background script.
  - [x] Implement initial user ID extraction logic in background script.
  - **Next Steps:**
    - [ ] **Thoroughly examine message payloads**: Deep dive into the structure of `GAME_DATA` and `CHAT_DATA` messages to identify all potential locations of user IDs and other relevant game state information.
    - [ ] **Refine `extractUserIds` function**: Based on payload analysis, make the user ID extraction in `background.js` more robust and comprehensive.
    - [ ] **Implement game session lifecycle management**: Detect game start/end events or other relevant signals from WebSocket messages to appropriately manage the `activeGameUserIds` set (e.g., clearing it when a game definitively ends or the user leaves).
    - [ ] Design and implement UI components in the popup to display currently active players based on intercepted data.
    - [ ] Implement a system for looking up user IDs to get player names (potentially integrating with existing player data or requiring new mechanisms if names aren't directly in WS messages).
    - [ ] Investigate methods to reliably associate intercepted game data with specific game sessions (public or private), especially if multiple games are being monitored or if session IDs aren't immediately obvious in all messages.

## Features to Implement

- [ ] **Refine UI for Current Game Players (Post-MVP)**: Once WebSocket interception is stable and core logic is robust, revisit displaying players from the *current* live game in a dedicated UI section in the popup (feature was previously on 'current-game-sockets' branch and removed for MVP focus).
    - Consider how to differentiate these from players in fetched historical/recent sessions.
- [x] **Refine Dark Mode Styling**: Improve the visual appearance and consistency of dark mode across all extension components.
- [x] **Replace `prompt()`** pop-ups in player management (add/edit) with a user-friendly modal dialog.

## Other Potential Enhancements

- [ ] Ensure uniform row height in the session list by handling long game names (e.g., truncation with tooltip or ellipsis).

## Future Ideas / Enhancements

- [ ] **Display Current Game Players via WebSocket Interception (Phase 2 - UI/UX)**
  - Goal: If WebSocket method is pursued, define how these players integrate into the popup.
  - Current State: Feature was on `current-game-sockets` branch, removed for MVP. Logic for this is distinct from historical session fetching.
- [x] **Advanced Player Search/Filtering in 'Manage Users' Tab**
  - [x] Sort by name, rating, last seen, unique sessions.
- [ ] **UI/UX Refinements**
  -   Consider more distinct visual cues for official vs. experimental games.
  -   Provide clearer feedback on import/export success/failure.
  - [ ] **Update Screenshots**: Update screenshots in `README.md` to reflect recent UI changes (modal system, button styles).
- [ ] **Firebase Integration - Phase 2 (Data Sync)**
    -   Basic authentication UI and setup is in place.
    -   Implement Firestore synchronization for `playerData` in `userManager.js` (`loadPlayerData`, `savePlayerData`).
    -   Define sync strategy (e.g., Firestore as source of truth, merge strategies for conflicts if any).

## Bugs / Technical Debt

- [ ] **Error Handling**: Enhance error handling and user feedback for API request failures or unexpected data formats beyond current console messages. (Improvements made, ongoing consideration for further enhancements).

## Long Term / Wishlist

- [ ] **Shared Player Lists (Teams/Groups)**: Allow users (perhaps via Firebase) to share curated player lists or notes with a trusted group.
- [ ] **Automated Tagging/Categorization**: Ideas for auto-tagging players based on roles frequently played if that data becomes available.

---
*Mark items with [x] when completed. Add new tasks as they arise.*
