# BotC Player Tracker - TODO List

This file tracks active bugs and planned future enhancements for the BotC Player Tracker extension.

## Current Bugs

*   [ ] Verify username updates and history tracking - ensure usernames are being properly updated when new data is fetched and username history is being maintained correctly
*   [ ] Player export function uses stale data - should fetch latest data from localStorage at time of export
*   [x] Favorites are not highlighted correctly in the UI.
*   [x] Current game detection fails - Player ID from botc.app JWT was not being correctly parsed and assigned due to an older function version taking precedence. Corrected JWT parsing and ensured correct function scope. (Fixed v1.1.8)
*   [x] Updating user information (e.g., notes, rating) doesn't always immediately refresh the user list or session views, even though the data is saved.
    *   [x] Session modal updates now trigger targeted UI refresh for the card and dependent views (Online Favs, User Mngmt List). (Fixed v1.1.10)
    *   Broader player management UI refresh (add/edit/delete/favorite from User Management) improved in v1.1.9.
*   [x] Long, unbroken player notes in User Management could overflow their container. (Fixed v1.1.10)

## Search Improvements

*   [ ] Add score filtering to search (e.g., 'score:4' to filter players with a score of 4)

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
