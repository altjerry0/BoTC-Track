/**
 * Utility functions for consistent timestamp handling
 */

/**
 * Converts any timestamp value to milliseconds format for storage
 * Always use this function when storing timestamps in chrome.storage
 * @param {Date|number|string} timestamp - The timestamp to convert
 * @returns {number} Timestamp in milliseconds
 */
export function toStorageTimestamp(timestamp) {
    if (timestamp instanceof Date) {
        return timestamp.getTime();
    } else if (typeof timestamp === 'string') {
        // Handle ISO strings or other string formats
        const parsed = Date.parse(timestamp);
        return isNaN(parsed) ? null : parsed;
    } else if (typeof timestamp === 'number') {
        return timestamp;
    }
    return null;
}

/**
 * Validates and ensures a timestamp is in the correct milliseconds format
 * @param {any} timestamp - The timestamp to validate
 * @returns {number|null} Timestamp in milliseconds or null if invalid
 */
export function fromStorageTimestamp(timestamp) {
    if (typeof timestamp === 'number' && !isNaN(timestamp) && timestamp > 0) {
        return timestamp;
    }
    return null;
}

/**
 * Converts a timestamp to a Firebase compatible format based on the field type
 * Use at Firebase boundaries when writing data
 * @param {number} timestamp - Timestamp in milliseconds
 * @param {boolean} useServerTimestamp - Whether to use serverTimestamp() instead
 * @returns {number} Timestamp in milliseconds (unchanged)
 */
export function toFirebaseTimestamp(timestamp) {
    // Firebase can handle millisecond timestamps directly
    // We just ensure it's a valid number
    return fromStorageTimestamp(timestamp);
}

/**
 * Formats a timestamp for display in a locale-sensitive way
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted date and time string
 */
export function formatTimestampForDisplay(timestamp) {
    const validTimestamp = fromStorageTimestamp(timestamp);
    if (!validTimestamp) {
        return "N/A";
    }
    const date = new Date(validTimestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Formats a timestamp into a human-readable 'time ago' string
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Human-readable "time ago" string
 */
export function formatTimeSince(timestamp) {
    const validTimestamp = fromStorageTimestamp(timestamp);
    if (!validTimestamp) {
        return "Not seen yet";
    }

    const now = Date.now();
    const seconds = Math.round((now - validTimestamp) / 1000);

    if (seconds < 0) {
        return "In the future";
    } else if (seconds < 60) {
        return seconds + (seconds === 1 ? " sec ago" : " secs ago");
    }

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return minutes + (minutes === 1 ? " min ago" : " mins ago");
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
        return hours + (hours === 1 ? " hour ago" : " hours ago");
    }

    const days = Math.round(hours / 24);
    if (days < 30) {
        return days + (days === 1 ? " day ago" : " days ago");
    }

    const months = Math.round(days / 30);
    if (months < 12) {
        return months + (months === 1 ? " month ago" : " months ago");
    }

    const years = Math.round(months / 12);
    return years + (years === 1 ? " year ago" : " years ago");
}
