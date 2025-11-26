/**
 * Application Configuration Constants
 */

// CORS proxies for streaming - tried in order until one works
export const CORS_PROXIES = [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://cors.isomorphic-git.org/",
    "https://thingproxy.freeboard.io/fetch/"
];

// ============================================================================
// PLAYLIST CONFIGURATION
// ============================================================================
// Playlist is now embedded as a JavaScript module in js/data/playlist.js
// This change resolves fetch() failures in Android APK environments.
//
// To update the playlist:
// 1. Click the "Convert Playlist" button in the app
// 2. Upload or paste your M3U8 content
// 3. Download the generated playlist.js file
// 4. Replace js/data/playlist.js with the new version
// 5. Reload the app to use the updated playlist
//
// See js/services/playlist.js for implementation details
// ============================================================================
