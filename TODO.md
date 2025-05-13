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

## v1.1.5 – Firebase/Firestore/Google Sign-In & Cloud Sync Groundwork

- [ ] **Bundle Firebase SDK with Webpack**
    - Install `firebase` and configure Webpack to bundle all required Firebase modules for Manifest V3 compatibility.
    - Ensure background, popup, and any content scripts that need Firebase import from the bundle.
- [ ] **Google Sign-In Integration**
    - Add Google authentication flow using Firebase Auth (Google provider).
    - Expose a UI element for login/logout in the extension popup.
    - Store the Firebase user ID upon login for use in Firestore document paths.
- [ ] **Firestore Cloud Sync**
    - Implement upload (push) and download (pull) of `playerData` to/from Firestore under `/userPlayerData/{firebaseUid}`.
    - Add a `lastUpdatedLocal` timestamp field to all local player data changes.
    - Fetch and display the `lastUpdatedLocal` and Firestore `lastUpdatedRemote` for comparison in the UI.
    - Add a manual "Sync Now"/"Check Cloud Status" button to the popup for users to compare and trigger sync.
- [ ] **Conflict Handling & Merge Strategy**
    - Define and document rules for resolving conflicts (e.g., always prefer the most recent, or prompt the user).
- [ ] **Manifest & CSP Updates**
    - Update `manifest.json` to point to bundled scripts.
    - Update CSP to allow Firebase and Google Auth endpoints.
- [ ] **Testing**
    - Test login, logout, sync, and error handling flows.
    - Test extension on both dark and light modes.
- [ ] **Documentation**
    - Update `README.md` with cloud sync and Google login instructions.
    - Add developer setup steps for Firebase/Firestore integration.
- [ ] **Release**
    - Prepare for v1.1.5 release with all above features.

---

## Other Potential Enhancements

- [ ] Ensure uniform row height in the session list by handling long game names (e.g., truncation with tooltip or ellipsis).

## Future Enhancements / Ideas

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
