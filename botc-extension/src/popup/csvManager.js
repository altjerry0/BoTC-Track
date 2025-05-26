/**
 * CSV Manager Module
 * Handles all CSV import and export functionality for player data.
 */

import { toStorageTimestamp, fromStorageTimestamp } from '../utils/timestampUtils.js';

// Helper function to escape CSV special characters (double quotes, commas, newlines).
// If a field contains a comma, newline, or double quote, it should be enclosed in double quotes.
// Existing double quotes within the field should be doubled.
function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

// Helper function to parse a single CSV row, handling quoted fields and escaped quotes.
function parseCsvRow(rowString) {
    const values = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];

        if (char === '"') {
            if (inQuotes && i + 1 < rowString.length && rowString[i + 1] === '"') {
                // Escaped double quote
                currentVal += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(currentVal);
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    values.push(currentVal); // Add the last value
    return values;
}

/**
 * Exports provided player data to a CSV file and triggers a download.
 * @param {Object} playerDataToExport - The player data object to export.
 */
function exportPlayerDataCSV(playerDataToExport) {
    if (Object.keys(playerDataToExport).length === 0) {
        // This check should ideally be in popup.js before calling
        console.warn("Export called with no data.");
        return; 
    }

    const headers = [
        'id', 'name', 'score', 'notes', 'isFavorite',
        'usernameHistory', 'sessionHistory', 'uniqueSessionCount',
        'lastSeenTimestamp', 'lastSeenSessionId'
    ];
    let csvContent = headers.join(',') + '\n';

    for (const id in playerDataToExport) {
        const player = playerDataToExport[id];
        const row = [
            player.id || id, // Ensure ID is present
            player.name || '',
            player.score === undefined ? '' : player.score,
            player.notes || '',
            player.isFavorite ? 'true' : 'false',
            player.usernameHistory ? JSON.stringify(player.usernameHistory) : '[]',
            player.sessionHistory ? JSON.stringify(player.sessionHistory) : '[]',
            player.uniqueSessionCount === undefined ? 0 : player.uniqueSessionCount,
            player.lastSeenTimestamp === undefined ? '' : player.lastSeenTimestamp,
            player.lastSeenSessionId || ''
        ].map(escapeCsvValue).join(',');
        csvContent += row + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        // Create dynamic filename with date and user count
        const playerCount = Object.keys(playerDataToExport).length;
        const date = new Date();
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed
        const day = ('0' + date.getDate()).slice(-2);
        const dateStamp = `${year}${month}${day}`;
        const fileName = `botc_player_data_${dateStamp}_${playerCount}users.csv`;

        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Imports player data from a CSV file.
 * @param {File} file - The CSV file object to import.
 * @param {Function} successCallback - Called with parsed player data if successful. function(parsedData)
 * @param {Function} statusCallback - Called with status messages. function(message, isError)
 */
function importPlayerDataCSV(file, successCallback, statusCallback) {
    console.log('[Importer] importPlayerDataCSV started for file:', file ? file.name : 'No file'); // Debug
    const reader = new FileReader();

    reader.onload = function (e) {
        console.log('[Importer] reader.onload triggered.'); // Debug
        const csvContent = e.target.result;
        const newPlayerData = {};
        const rows = csvContent.split('\n');

        if (rows.length < 2) {
            statusCallback('CSV file is empty or has no data rows.', true);
            return;
        }

        const headerRow = rows[0].trim();
        const headers = parseCsvRow(headerRow);
        // Expected headers (adjust if your export format differs slightly or if you want to be more flexible)
        const expectedHeaders = ['id', 'name', 'score', 'notes', 'isFavorite', 'usernameHistory', 'sessionHistory', 'uniqueSessionCount', 'lastSeenTimestamp', 'lastSeenSessionId'];
        const headerMap = {};
        expectedHeaders.forEach(eh => {
            const index = headers.findIndex(h => h.trim().toLowerCase() === eh.toLowerCase());
            if (index !== -1) headerMap[eh] = index;
        });

        if (headerMap.id === undefined || headerMap.name === undefined) { // Essential headers
            statusCallback('CSV headers are missing or incorrect. Essential headers: id, name.', true);
            return;
        }

        let playersImportedCount = 0;
        for (let i = 1; i < rows.length; i++) {
            const rowString = rows[i].trim();
            if (!rowString) continue; // Skip empty rows

            const values = parseCsvRow(rowString);
            const player = {};
            const id = values[headerMap.id];

            if (!id) {
                console.warn('Skipping row due to missing ID:', values);
                continue;
            }

            player.id = id;
            player.name = values[headerMap.name] || '';
            player.score = headerMap.score !== undefined && values[headerMap.score] !== '' ? parseInt(values[headerMap.score], 10) : null;
            player.notes = headerMap.notes !== undefined ? values[headerMap.notes] || '' : '';
            player.isFavorite = headerMap.isFavorite !== undefined ? (values[headerMap.isFavorite] || '').toLowerCase() === 'true' : false;
            
            try {
                player.usernameHistory = headerMap.usernameHistory !== undefined && values[headerMap.usernameHistory] ? JSON.parse(values[headerMap.usernameHistory]) : [];
            } catch (err) {
                console.warn(`Error parsing usernameHistory for player ${id}:`, err, `Value: ${values[headerMap.usernameHistory]}`);
                player.usernameHistory = [];
            }
            try {
                player.sessionHistory = headerMap.sessionHistory !== undefined && values[headerMap.sessionHistory] ? JSON.parse(values[headerMap.sessionHistory]) : [];
            } catch (err) {
                console.warn(`Error parsing sessionHistory for player ${id}:`, err, `Value: ${values[headerMap.sessionHistory]}`);
                player.sessionHistory = [];
            }

            player.uniqueSessionCount = headerMap.uniqueSessionCount !== undefined && values[headerMap.uniqueSessionCount] !== '' ? parseInt(values[headerMap.uniqueSessionCount], 10) : 0;
            player.lastSeenTimestamp = headerMap.lastSeenTimestamp !== undefined && values[headerMap.lastSeenTimestamp] !== '' ? toStorageTimestamp(parseInt(values[headerMap.lastSeenTimestamp], 10)) : null;
            player.lastSeenSessionId = headerMap.lastSeenSessionId !== undefined ? values[headerMap.lastSeenSessionId] || '' : '';
            
            // Basic validation for score
            if (player.score !== null && (isNaN(player.score) || player.score < 1 || player.score > 5)) {
                console.warn(`Invalid score for player ${id}: ${values[headerMap.score]}. Setting to null.`);
                player.score = null; 
            }
            if (isNaN(player.uniqueSessionCount)) player.uniqueSessionCount = 0;
            player.lastSeenTimestamp = fromStorageTimestamp(player.lastSeenTimestamp);

            newPlayerData[id] = player;
            playersImportedCount++;
        }

        if (playersImportedCount === 0) {
            statusCallback('No valid player data found in CSV to import.', true);
            return;
        }
        
        console.log('[Importer] Parsed players:', playersImportedCount, 'Calling successCallback.'); // Debug
        successCallback(newPlayerData);
    };

    reader.onerror = function () {
        console.error('[Importer] reader.onerror triggered.'); // Debug
        statusCallback('Failed to read the file.', true);
    };

    console.log('[Importer] Calling reader.readAsText...'); // Debug
    reader.readAsText(file);
}

window.exportPlayerDataCSV = exportPlayerDataCSV;
window.importPlayerDataCSV = importPlayerDataCSV;
