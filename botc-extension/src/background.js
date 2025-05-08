chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

let authToken = null;

// Listen for network requests to extract the Authorization token
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const authHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "authorization");
        if (authHeader && authHeader.value.startsWith("Bearer ")) {
            authToken = authHeader.value;
            // console.log("Authorization token extracted:", authToken); // Removed for production
        }
    },
    { urls: ["*://botc.app/*"] },
    ["requestHeaders"]
);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "storeAuthToken") {
        authToken = request.authToken;
        sendResponse({ success: true });
        return false; // No async response needed here
    } else if (request.action === "requestSession" || request.action === "fetchSessions") { 
        if (!authToken) {
            console.warn("Auth token missing for session fetch.");
            sendResponse({ error: "Authorization token not available" });
            return false; // No async response needed here
        }

        fetch("https://botc.app/backend/sessions", {
            method: "GET",
            headers: {
                "Authorization": authToken
            }
        })
        .then(response => response.json().then(data => ({ status: response.status, ok: response.ok, data })))
        .then(({ status, ok, data }) => {
            // console.log("API response data:", data); // Removed for production
            if (ok) {
                // Send response in the format expected by sessionManager.js
                sendResponse({ sessions: data });
            } else {
                console.error("API returned an error:", data);
                sendResponse({ error: `API Error ${status}: ${JSON.stringify(data)}` });
            }
        })
        .catch(error => {
            console.error("Error fetching session data:", error);
            sendResponse({ error: error.message || "Network error" });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});