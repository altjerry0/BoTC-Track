// accountTab.js - Handles the Account/Cloud Sync tab UI and logic
// Account Tab module for handling user authentication and cloud sync features

import { toStorageTimestamp, formatTimestampForDisplay } from '../utils/timestampUtils.js';

// DOM references
let accountTab, accountStatus, signInBtn, signOutBtn;
// Cloud sync elements
let cloudSyncControls, pushToCloudBtn, fetchFromCloudBtn, syncStatus, lastSyncTime;

// Rate limiting configuration
const RATE_LIMIT = {
    // Minimum time (in milliseconds) between operations
    PUSH_COOLDOWN: 10000,  // 10 seconds between push operations
    FETCH_COOLDOWN: 10000, // 10 seconds between fetch operations
    lastPushTime: 0,       // Timestamp of the last push operation
    lastFetchTime: 0       // Timestamp of the last fetch operation
};

function initAccountTab() {
    // --- Extension Version Display ---
    let versionDiv = document.getElementById('extensionVersion');
    if (!versionDiv) {
        versionDiv = document.createElement('div');
        versionDiv.id = 'extensionVersion';
        versionDiv.style.fontSize = '12px';
        versionDiv.style.color = '#888';
        versionDiv.style.marginTop = '18px';
        // Insert at the bottom of the account tab
        setTimeout(() => {
            const tab = document.getElementById('accountTab');
            if (tab) tab.appendChild(versionDiv);
        }, 0);
    }
    const manifest = chrome.runtime.getManifest();
    if (manifest && manifest.version) {
        versionDiv.textContent = `Extension Version: v${manifest.version}`;
    } else {
        versionDiv.textContent = '';
    }

    // Initialize the account tab UI elements
    // Basic account elements
    accountTab = document.getElementById('accountTab');
    accountStatus = document.getElementById('accountStatus');
    signInBtn = document.getElementById('signInBtn');
    signOutBtn = document.getElementById('signOutBtn');
    
    // Cloud sync elements
    cloudSyncControls = document.getElementById('cloudSyncControls');
    pushToCloudBtn = document.getElementById('pushToCloudBtn');
    fetchFromCloudBtn = document.getElementById('fetchFromCloudBtn');
    syncStatus = document.getElementById('syncStatus');
    lastSyncTime = document.getElementById('lastSyncTime');

    // Button event listeners for authentication
    signInBtn.addEventListener('click', () => {
        accountStatus.textContent = 'Signing in...';
        // Open a new tab to the auth page instead of using a popup
        chrome.tabs.create({
            url: chrome.runtime.getURL('src/auth/auth.html')
        }, (tab) => {
            console.log('Auth tab created:', tab.id);
            // We'll listen for auth result via chrome.storage changes
        });
        
        // Listen for auth status changes
        const authListener = (changes, area) => {
            if (area === 'local' && changes.authUser) {
                console.log('Auth status changed:', changes.authUser.newValue);
                chrome.storage.onChanged.removeListener(authListener);
                if (changes.authUser.newValue) {
                    renderAccountState(changes.authUser.newValue);
                    loadLastSyncTime(); // Load sync time info when signing in
                }
            }
        };
        
        chrome.storage.onChanged.addListener(authListener);
    });
    
    signOutBtn.addEventListener('click', () => {
        accountStatus.textContent = 'Signing out...';
        chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
            renderAccountState(null);
        });
    });
    
    // Button event listeners for cloud sync
    pushToCloudBtn.addEventListener('click', pushToCloud);
    fetchFromCloudBtn.addEventListener('click', fetchFromCloud);

    // Initial render (poll for auth state)
    pollAuthState();
    
    // Set up storage change listener for sync status updates
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.lastSyncTime) {
            updateLastSyncTime(changes.lastSyncTime.newValue);
        }
    });
}

function pushToCloud() {
    const now = toStorageTimestamp(Date.now());
    const timeElapsed = now - RATE_LIMIT.lastPushTime;
    
    // Check if we're within the cooldown period
    if (RATE_LIMIT.lastPushTime > 0 && timeElapsed < RATE_LIMIT.PUSH_COOLDOWN) {
        const secondsRemaining = Math.ceil((RATE_LIMIT.PUSH_COOLDOWN - timeElapsed) / 1000);
        showSyncStatus(`Please wait ${secondsRemaining} seconds before pushing data again`, 'warning');
        return; // Exit early, don't perform the operation
    }
    
    // Update the last push time immediately to prevent multiple clicks
    RATE_LIMIT.lastPushTime = now;
    
    showSyncStatus('Pushing your data to the cloud...', 'info');
    disableSyncButtons(true);
    
    chrome.runtime.sendMessage({ type: 'PUSH_TO_CLOUD' }, (response) => {
        disableSyncButtons(false);
        
        if (response && response.success) {
            showSyncStatus('Successfully pushed data to the cloud!', 'success');
            saveLastSyncTime();
        } else {
            const errorMsg = response && response.error ? response.error : 'Unknown error';
            showSyncStatus(`Error pushing data: ${errorMsg}`, 'error');
            // If there was an error, reset the rate limit timer so they can try again sooner
            RATE_LIMIT.lastPushTime = now - (RATE_LIMIT.PUSH_COOLDOWN / 2);
        }
    });
}

function fetchFromCloud() {
    const now = toStorageTimestamp(Date.now());
    const timeElapsed = now - RATE_LIMIT.lastFetchTime;
    
    // Check if we're within the cooldown period
    if (RATE_LIMIT.lastFetchTime > 0 && timeElapsed < RATE_LIMIT.FETCH_COOLDOWN) {
        const secondsRemaining = Math.ceil((RATE_LIMIT.FETCH_COOLDOWN - timeElapsed) / 1000);
        showSyncStatus(`Please wait ${secondsRemaining} seconds before fetching data again`, 'warning');
        return; // Exit early, don't perform the operation
    }
    
    // Update the last fetch time immediately to prevent multiple clicks
    RATE_LIMIT.lastFetchTime = now;
    
    showSyncStatus('Fetching data from the cloud...', 'info');
    disableSyncButtons(true);
    
    chrome.runtime.sendMessage({ type: 'FETCH_FROM_CLOUD' }, (response) => {
        disableSyncButtons(false);
        
        if (response && response.success) {
            showSyncStatus('Successfully fetched data from the cloud!', 'success');
            saveLastSyncTime();
            
            // Notify the user if any player data was updated
            if (response.updated) {
                // If we're on the user management tab, trigger a refresh
                const userManagementTab = document.getElementById('userManagement');
                if (userManagementTab && userManagementTab.classList.contains('active')) {
                    // If window.refreshPlayerList exists (from userManager.js), call it
                    if (typeof window.refreshPlayerList === 'function') {
                        window.refreshPlayerList();
                    }
                }
            }
        } else {
            const errorMsg = response && response.error ? response.error : 'Unknown error';
            showSyncStatus(`Error fetching data: ${errorMsg}`, 'error');
            // If there was an error, reset the rate limit timer so they can try again sooner
            RATE_LIMIT.lastFetchTime = now - (RATE_LIMIT.FETCH_COOLDOWN / 2);
        }
    });
}

function showSyncStatus(message, type) {
    syncStatus.textContent = message;
    syncStatus.className = 'sync-status'; // Clear existing classes
    
    // Map the type to appropriate class
    switch(type) {
        case 'success':
            syncStatus.classList.add('success');
            break;
        case 'error':
            syncStatus.classList.add('error');
            break;
        case 'warning':
            syncStatus.classList.add('warning'); // New warning class
            break;
        case 'info':
        default:
            syncStatus.classList.add('info');
            break;
    }
    
    // Add inline styles for warning status if the CSS class isn't applied via CSS file
    if (type === 'warning') {
        syncStatus.style.backgroundColor = '#fff3cd'; // Light yellow
        syncStatus.style.color = '#856404'; // Dark yellow/brown
        syncStatus.style.border = '1px solid #ffeeba';
        
        // Auto-hide warning messages after 10 seconds (longer than success/info)
        setTimeout(() => {
            syncStatus.textContent = '';
            syncStatus.className = 'sync-status';
            syncStatus.style.backgroundColor = '';
            syncStatus.style.color = '';
            syncStatus.style.border = '';
        }, 10000);
    }
    // Auto-hide success and info messages after 5 seconds
    else if (type === 'success' || type === 'info') {
        setTimeout(() => {
            syncStatus.textContent = '';
            syncStatus.className = 'sync-status';
        }, 5000);
    }
}

function disableSyncButtons(disabled) {
    pushToCloudBtn.disabled = disabled;
    fetchFromCloudBtn.disabled = disabled;
    
    // Visual feedback that buttons are disabled
    if (disabled) {
        pushToCloudBtn.style.opacity = '0.7';
        fetchFromCloudBtn.style.opacity = '0.7';
    } else {
        pushToCloudBtn.style.opacity = '1';
        fetchFromCloudBtn.style.opacity = '1';
    }
}

function saveLastSyncTime() {
    const now = toStorageTimestamp(Date.now());
    chrome.storage.local.set({ lastSyncTime: now });
    updateLastSyncTime(now);
}

function loadLastSyncTime() {
    chrome.storage.local.get('lastSyncTime', (result) => {
        if (result.lastSyncTime) {
            updateLastSyncTime(result.lastSyncTime);
        } else {
            lastSyncTime.textContent = 'Last synchronized: Never';
        }
    });
}

function updateLastSyncTime(timestamp) {
    if (!timestamp) {
        lastSyncTime.textContent = 'Last synchronized: Never';
        return;
    }
    
    const formattedTimestamp = formatTimestampForDisplay(timestamp);
    lastSyncTime.textContent = `Last synchronized: ${formattedTimestamp}`;
}

function pollAuthState() {
    // Poll background for auth state
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
        if (response && response.user) {
            renderAccountState(response.user);
            loadLastSyncTime(); // Load sync time info when already signed in
        } else {
            renderAccountState(null);
        }
    });
}

function renderAccountState(user) {
    if (user) {
        accountStatus.textContent = `Signed in as ${user.email}`;
        signInBtn.style.display = 'none';
        signOutBtn.style.display = '';
        cloudSyncControls.style.display = ''; // Show cloud sync controls when signed in
    } else {
        accountStatus.textContent = 'Not signed in.';
        signInBtn.style.display = '';
        signOutBtn.style.display = 'none';
        cloudSyncControls.style.display = 'none'; // Hide cloud sync controls when signed out
    }
}

// Expose for popup.js to call
window.initAccountTab = initAccountTab;
