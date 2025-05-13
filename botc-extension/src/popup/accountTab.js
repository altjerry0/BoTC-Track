// accountTab.js - Handles the Account/Cloud Sync tab UI and logic
console.log("accountTab.js loaded");

// DOM references
let accountTab, accountStatus, signInBtn, signOutBtn;
// Cloud sync elements
let cloudSyncControls, pushToCloudBtn, fetchFromCloudBtn, syncStatus, lastSyncTime;

function initAccountTab() {
    console.log("initAccountTab called");
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
        }
    });
}

function fetchFromCloud() {
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
        }
    });
}

function showSyncStatus(message, type) {
    syncStatus.textContent = message;
    syncStatus.className = 'sync-status'; // Clear existing classes
    syncStatus.classList.add(type); // Add the appropriate class (success, error, info)
    
    // Auto-hide success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            syncStatus.style.display = 'none';
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
    const now = new Date();
    chrome.storage.local.set({ lastSyncTime: now.toISOString() });
    updateLastSyncTime(now.toISOString());
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

function updateLastSyncTime(isoTimeString) {
    if (!isoTimeString) {
        lastSyncTime.textContent = 'Last synchronized: Never';
        return;
    }
    
    const syncDate = new Date(isoTimeString);
    const formattedDate = syncDate.toLocaleDateString();
    const formattedTime = syncDate.toLocaleTimeString();
    lastSyncTime.textContent = `Last synchronized: ${formattedDate} ${formattedTime}`;
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
