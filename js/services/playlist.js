/**
 * Playlist Service
 * Handles loading and parsing M3U/M3U8 playlist files
 */

import { PLAYLIST_FILES } from '../config/constants.js';
import { parseExtInf } from '../utils/parser.js';

/**
 * Fetch the playlist text from one of the candidate files
 * @returns {Promise<string>} Playlist content
 * @throws {Error} If no playlist file is found
 */
async function fetchPlaylistText() {
    for (const filename of PLAYLIST_FILES) {
        try {
            const res = await fetch(filename);
            if (res.ok) {
                console.log("Loaded playlist:", filename);
                return await res.text();
            }
        } catch (e) {
            // Try next file
        }
    }
    throw new Error("No playlist file found");
}

/**
 * Load and parse the channel list from the playlist
 * @returns {Promise<Array>} Array of channel objects {name, logo, group, url}
 * @throws {Error} If playlist cannot be loaded or parsed
 */
export async function loadChannelList() {
    try {
        const text = await fetchPlaylistText();
        const lines = text.split(/\r?\n/);
        const channels = [];
        let currentMeta = { name: "", logo: "", group: "" };

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith("#EXTINF")) {
                currentMeta = parseExtInf(line);
            } else if (line.startsWith("http://") || line.startsWith("https://")) {
                channels.push({
                    name: currentMeta.name,
                    logo: currentMeta.logo,
                    group: currentMeta.group,
                    url: line,
                });
            }
        }

        return channels;
    } catch (e) {
        console.error("Error loading playlist:", e);
        throw e;
    }
}
