# BotC Tracker - Testing Guide

This document outlines the testing procedures for the BotC Tracker extension, including both manual test cases and potential automation strategies.

## Table of Contents
1. [Manual Testing](#manual-testing)
   - [Authentication](#authentication)
   - [User Management](#user-management)
   - [Session Management](#session-management)
   - [Cloud Sync](#cloud-sync)
   - [UI/UX](#uiux)
2. [Automation Strategy](#automation-strategy)
3. [Test Data Management](#test-data-management)
4. [Known Issues](#known-issues)

## Manual Testing

### Authentication

#### Sign In
1. **Test Case**: Successful Sign In
   - Steps:
     1. Open extension popup
     2. Click "Sign In" button
     3. Complete authentication flow
   - Expected: User is authenticated, UI updates to show user email/name

2. **Test Case**: Sign Out
   - Steps:
     1. While signed in, click user profile
     2. Select "Sign Out"
   - Expected: User is signed out, UI resets to anonymous state

### User Management

#### CRUD Operations
1. **Add Player**
   - Steps:
     1. Navigate to User Management tab
     2. Click "Add Player" button
     3. Fill in player details and save
   - Expected: New player appears in the list

2. **Edit Player**
   - Steps:
     1. Find existing player
     2. Click edit (pencil) icon
     3. Modify details and save
   - Expected: Player details are updated

3. **Delete Player**
   - Steps:
     1. Find existing player
     2. Click delete (trash) icon
     3. Confirm deletion
   - Expected: Player is removed from the list

#### Import/Export
1. **Export Players**
   - Steps:
     1. Navigate to User Management
     2. Click "Export Players"
   - Expected: CSV file downloads with player data

2. **Import Players**
   - Steps:
     1. Navigate to User Management
     2. Click "Import Players"
     3. Select valid export file
   - Expected: Players are imported and visible in the list

### Session Management

1. **Fetch Session Data**
   - Steps:
     1. Open extension while on botc.app
     2. Navigate to Session List tab
   - Expected: Current session data is displayed

2. **Favorites**
   - Steps:
     1. Find a session
     2. Click star icon to favorite
   - Expected: Star becomes filled, session appears in favorites

3. **Click to Join**
   - Steps:
     1. Find an active session
     2. Click "Join" button
   - Expected: Browser navigates to the session

4. **Player Roles**
   - Steps:
     1. View session with players
   - Expected: Players are correctly badged as Spectators/Players/Storytellers

### Cloud Sync

1. **Initial Sync**
   - Steps:
     1. Sign in on new device
   - Expected: Player data syncs from cloud

2. **Multi-device Sync**
   - Steps:
     1. Make change on Device A
     2. Check Device B
   - Expected: Changes appear on Device B

### UI/UX

1. **Theme Switching**
   - Steps:
     1. Toggle theme in settings
   - Expected: UI updates to selected theme

2. **Responsive Design**
   - Steps:
     1. Resize browser window
   - Expected: UI elements adjust appropriately

## Automation Strategy

### Unit Tests
- Test individual utility functions
- Mock external dependencies
- Focus on business logic

### Integration Tests
- Test component interactions
- Mock Chrome extension APIs
- Test data flow between components

### E2E Tests (Potential)
- Use Puppeteer/Playwright
- Test complete user flows
- Run against staging environment

### Test Data Management
- Use factory functions for test data
- Clean up after tests
- Consider using test accounts

## Known Issues
- [ ] List any known issues here
- [ ] Include reproduction steps
- [ ] Add expected vs actual behavior

## Running Tests

### Manual Testing
1. Load unpacked extension in Chrome
2. Follow test cases above
3. Document any issues found

### Automated Testing (Future)
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run e2e tests (when implemented)
npm run test:e2e
```
