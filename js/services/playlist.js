/**
 * Playlist Service
 * Loads and manages the embedded channel list
 *
 * NOTE: Playlist is now embedded as a JavaScript module to resolve
 * fetch() failures in Android APK environments. Use the browser-based
 * converter tool to update the playlist.
 */

import { CHANNELS } from '../data/playlist.js';

/**
 * Load the channel list from the embedded playlist
 * @returns {Promise<Array>} Array of channel objects {name, logo, group, url}
 * @throws {Error} If playlist data cannot be loaded
 */
export async function loadChannelList() {
    try {
        console.log("Loaded embedded playlist with", CHANNELS.length, "channels");
        return CHANNELS;
    } catch (e) {
        console.error("Error loading playlist:", e);
        throw e;
    }
}
