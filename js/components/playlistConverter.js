/**
 * Playlist Converter Utility
 * Converts M3U/M3U8 files to JavaScript module format
 */

import { parseExtInf } from '../utils/parser.js';

/**
 * Convert M3U8 text content to JavaScript module code
 * @param {string} m3uContent - Raw M3U8 file content
 * @returns {string} JavaScript module code
 * @throws {Error} If parsing fails
 */
export function convertM3UToJavaScript(m3uContent) {
    if (!m3uContent || typeof m3uContent !== 'string') {
        throw new Error("Invalid M3U8 content");
    }

    const lines = m3uContent.split(/\r?\n/);
    const channels = [];
    let currentMeta = { name: "", logo: "", group: "" };
    const groups = new Set();

    for (let line of lines) {
        line = line.trim();

        // Skip empty lines and header
        if (!line || line === "#EXTM3U") continue;

        if (line.startsWith("#EXTINF")) {
            currentMeta = parseExtInf(line);
            if (currentMeta.group) {
                groups.add(currentMeta.group);
            }
        } else if (line.startsWith("http://") || line.startsWith("https://")) {
            channels.push({
                name: currentMeta.name,
                logo: currentMeta.logo,
                group: currentMeta.group,
                url: line,
            });
        }
    }

    if (channels.length === 0) {
        throw new Error("No valid channels found in M3U8 file");
    }

    // Generate JavaScript module
    const timestamp = new Date().toISOString();
    const groupsArray = Array.from(groups).sort();

    const jsCode = `/**
 * Playlist Data Module
 * Auto-generated from M3U8 file
 * Generated: ${timestamp}
 * Total Channels: ${channels.length}
 * Groups: ${groupsArray.length}
 */

export const CHANNELS = ${JSON.stringify(channels, null, 2)};

export const CHANNEL_COUNT = ${channels.length};

export const CHANNEL_GROUPS = ${JSON.stringify(groupsArray, null, 2)};
`;

    return jsCode;
}
