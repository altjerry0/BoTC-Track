# BotC Player Tracker - TODO List

This file tracks active bugs and planned future enhancements for the BotC Player Tracker extension.

## Current Bugs

*   [x] Favorites are not highlighted correctly in the UI.
*   [x] Current game detection fails - Player ID from botc.app JWT was not being correctly parsed and assigned due to an older function version taking precedence. Corrected JWT parsing and ensured correct function scope. (Fixed v1.2.1)
*   [x] Updating user information (e.g., notes, rating) doesn't always immediately refresh the user list or session views, even though the data is saved.

## Future Features

*   [ ] *Enhanced Conflict Resolution for cloud sync (preview differences, intelligent merge)*
*   [ ] *Optional automatic background sync with delta updates*
*   [ ] *Multi-device consistency improvements (last-device-used indicator)*
*   [ ] *Enhanced offline support (pending changes queue)*
*   [ ] *Sync analytics (optional, privacy-focused)*
*   [ ] *Uniform row height in session list (handle long game names)*
*   [X] *Shared Player Lists (Teams/Groups via Firebase)*
*   [ ] *Automated Tagging/Categorization of players based on roles (if data becomes available)*
*   [ ] *Review Firebase billing and optimize for cost-effectiveness (e.g., data listeners, function efficiency, Firestore queries)*
