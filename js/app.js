/**
 * Main Application Entry Point
 * Initializes all components and starts the application
 */

import { setupSearch, initChannelList } from './components/channelList.js';
import { setupSidebarToggle } from './components/sidebar.js';
import { setupPlaylistConverter } from './components/playlistConverter.js';
import { loadChannelList } from './services/playlist.js';
import { playStream } from './services/player.js';

/**
 * Initialize the application
 */
async function init() {
    try {
        // Setup UI components
        setupSearch();
        setupSidebarToggle();
        setupPlaylistConverter();

        // Load and display channels
        const channels = await loadChannelList();
        initChannelList(channels);

        // Auto-play first channel if available
        if (channels.length > 0) {
            playStream(channels[0].url);
        }
    } catch (error) {
        console.error("Application initialization failed:", error);

        const channelsDiv = document.getElementById("channels");
        if (channelsDiv) {
            channelsDiv.innerHTML = '<div class="error-message">Error loading playlist file.</div>';
        }
    }
}

// Start the application when DOM is ready
init();
