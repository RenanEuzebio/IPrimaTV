/**
 * M3U Playlist Parser Utilities
 * Pure utility functions for parsing M3U/M3U8 playlist formats
 */

/**
 * Parse an #EXTINF line to extract channel metadata
 * @param {string} line - The EXTINF line from the playlist
 * @returns {Object} Parsed metadata {name, logo, group}
 */
export function parseExtInf(line) {
    const comma = line.lastIndexOf(",");
    const name = comma !== -1 ? line.substring(comma + 1).trim() : "Unnamed channel";

    const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
    const logo = logoMatch ? logoMatch[1] : "";

    const groupMatch = line.match(/group-title="([^"]*)"/i);
    const group = groupMatch ? groupMatch[1] : "";

    return { name, logo, group };
}
