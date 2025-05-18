# BotC Player Tracker - TODO List

This file tracks planned features and improvements for the BotC Player Tracker extension.

## Features to Implement

- [x] **Investigate Player Not Found**: Debug logs indicate instances where players are not found in player data during session history updates. This may require further investigation into player data management and synchronization, especially with WebSocket updates.
- [x] **Refine UI for Current Game Players (Post-MVP)**: Addressed by implementing distinct visual highlighting for the session matching the current `botc.app/play` tab (blue glow) and sessions the user is participating in (orange glow). This provides clear differentiation directly within the existing session list. ~~Once WebSocket interception is stable and core logic is robust, revisit displaying players from the *current* live game in a dedicated UI section in the popup (feature was previously on 'current-game-sockets' branch and removed for MVP focus).~~
    ~~- Consider how to differentiate these from players in fetched historical/recent sessions.~~
- [x] **Refine Dark Mode Styling**: Improve the visual appearance and consistency of dark mode across all extension components.
- [x] **Replace `prompt()`** pop-ups in player management (add/edit) with a user-friendly modal dialog.
- [x] **Player Data Persistence and Refactoring**: Completed in v1.2.0, including resolving player names not persisting correctly, addressing potential race conditions, and refactoring `sessionManager.js` to utilize `userManager` functions.

---

## v1.1.5 – Firebase/Firestore/Google Sign-In & Cloud Sync (Completed)

- [x] **Bundle Firebase SDK with Webpack**
    - Installed `firebase` and configured Webpack to bundle all required Firebase modules for Manifest V3 compatibility.
    - Background script now properly imports from the bundle via `background.bundle.js`.
- [x] **Google Sign-In Integration**
    - Added Google authentication flow using Chrome's Identity API and Firebase Auth.
    - Implemented dedicated Account tab with login/logout UI elements.
    - Successfully storing the Firebase user ID upon login for use in Firestore document paths.
- [x] **Firestore Cloud Sync**
    - Implemented upload (push) and download (pull) of `playerData` to/from Firestore under `/userPlayerData/{firebaseUid}`.
    - Added timestamp tracking for sync operations with visual indicators.
    - Created manual "Push Local Data to Cloud" and "Fetch Latest Data from Cloud" buttons in the Account tab.
    - Implemented proper error handling and rate limiting to prevent API abuse.
- [x] **Conflict Handling & Merge Strategy**
    - Defined strategy where explicit user actions (push/pull) determine direction of sync.
    - User has full control over when to push local changes or pull cloud changes.
- [x] **Manifest & CSP Updates**
    - Updated `manifest.json` to point to bundled scripts.
    - Updated Content Security Policy to allow Firebase and Google Auth endpoints.
- [x] **Testing**
    - Tested login, logout, sync, and error handling flows in both light and dark modes.
- [x] **Documentation**
    - Updated `README.md` with cloud sync and Google login instructions.
    - Added developer setup steps for npm, Webpack, and Firebase integration.
- [x] **Release**
    - Prepared v1.2.0 release with all above features.

## v1.2.0 – Cloud Sync Refinements & Future Roadmap

- [ ] **Enhanced Conflict Resolution**
    - Implement more intelligent merging of cloud and local data when conflicts occur.
    - Add option to preview differences before committing to sync.
- [ ] **Automatic Background Sync**
    - Add an optional setting for automatic background sync at configurable intervals.
    - Implement bandwidth-saving delta updates.
- [ ] **Multi-device Consistency**
    - Improve handling of data synchronized across multiple devices.
    - Add last-device-used indicator in the UI.
- [ ] **Offline Support**
    - Enhance offline functionality with pending changes queue.
    - Add visual indicators for pending uploads.
- [ ] **Sync Analytics**
    - Add usage statistics for sync operations (optional and privacy-focused).
    - Track sync success/failure rates for quality monitoring.

---

## Fixes & Improvements Completed

- [x] **Fix Add Player Functionality**: Fixed the "Add Player" button in User Management tab which was showing "Player not found" error. Enhanced with improved validation, proper error messages, and guidance on ID format requirements.

## Other Potential Enhancements

- [ ] Ensure uniform row height in the session list by handling long game names (e.g., truncation with tooltip or ellipsis).

## Future Enhancements / Ideas


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
