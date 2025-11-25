/**
 * Stream Info Component
 * Manages status/info messages displayed in the sidebar
 */

let currentInfoElement = null;

/**
 * Show a stream info message in the sidebar
 * @param {string} message - Message to display
 */
export function showStreamInfo(message) {
    // Remove existing info message if present
    hideStreamInfo();

    // Create new info element
    const streamInfo = document.createElement('div');
    streamInfo.className = 'stream-info';
    streamInfo.textContent = message;

    // Add to sidebar
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.appendChild(streamInfo);
        currentInfoElement = streamInfo;
    }
}

/**
 * Update the current stream info message
 * @param {string} message - New message to display
 */
export function updateStreamInfo(message) {
    if (currentInfoElement) {
        currentInfoElement.textContent = message;
    } else {
        showStreamInfo(message);
    }
}

/**
 * Hide/remove the current stream info message
 */
export function hideStreamInfo() {
    if (currentInfoElement) {
        currentInfoElement.remove();
        currentInfoElement = null;
    }
}
