/**
 * Application Configuration Constants
 */

// CORS proxies for streaming - tried in order until one works
export const CORS_PROXIES = [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://cors.isomorphic-git.org/",
    "https://thingproxy.freeboard.io/fetch/"
];

// Playlist file candidates to try loading
export const PLAYLIST_FILES = ["lista.m3u8", "lista.m3u"];
