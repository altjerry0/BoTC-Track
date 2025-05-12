# BotC Player Tracker - TODO List

This file tracks planned features and improvements for the BotC Player Tracker extension.

## Features to Implement

- [x] **Investigate Player Not Found**: Debug logs indicate instances where players are not found in player data during session history updates. This may require further investigation into player data management and synchronization, especially with WebSocket updates.
- [x] **Refine UI for Current Game Players (Post-MVP)**: Addressed by implementing distinct visual highlighting for the session matching the current `botc.app/play` tab (blue glow) and sessions the user is participating in (orange glow). This provides clear differentiation directly within the existing session list. ~~Once WebSocket interception is stable and core logic is robust, revisit displaying players from the *current* live game in a dedicated UI section in the popup (feature was previously on 'current-game-sockets' branch and removed for MVP focus).~~
    ~~- Consider how to differentiate these from players in fetched historical/recent sessions.~~
- [x] **Refine Dark Mode Styling**: Improve the visual appearance and consistency of dark mode across all extension components.
- [x] **Replace `prompt()`** pop-ups in player management (add/edit) with a user-friendly modal dialog.

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
