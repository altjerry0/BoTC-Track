// Utility functions for authentication

/**
 * Parse a JWT token and extract the user ID
 * @param {string} token - The JWT token to parse
 * @returns {string|null} The user ID from the token, or null if invalid
 */
export function parseJwt(token) {
    if (!token) {
        console.warn("Attempted to parse a null or empty token.");
        return null;
    }
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            console.error("Invalid JWT: Missing payload.");
            return null;
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        // Try different fields used by Firebase and our auth service
        return decodedToken.uid || decodedToken.sub || decodedToken.id || null;
    } catch (error) {
        console.error('Failed to parse JWT:', error);
        return null;
    }
}
