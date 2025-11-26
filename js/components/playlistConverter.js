/**
 * Playlist Converter Component
 * Converts M3U/M3U8 files to JavaScript module format
 *
 * Features:
 * - File upload support
 * - Text paste support
 * - Real-time preview
 * - Download generated module
 * - Error handling and validation
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

/**
 * Setup the playlist converter UI and event handlers
 */
export function setupPlaylistConverter() {
    // Get DOM elements
    const converterBtn = document.getElementById("converterBtn");
    const converterModal = document.getElementById("converterModal");
    const fileInput = document.getElementById("m3uFileInput");
    const textInput = document.getElementById("m3uTextInput");
    const outputCode = document.getElementById("outputCode");
    const downloadBtn = document.getElementById("downloadPlaylistBtn");
    const closeBtn = document.getElementById("closeConverterBtn");
    const charCount = document.getElementById("charCount");
    const channelCount = document.getElementById("channelCount");

    // Exit if converter not in DOM
    if (!converterBtn || !converterModal) {
        console.warn("Converter elements not found in DOM");
        return;
    }

    // Open converter modal
    converterBtn.addEventListener("click", () => {
        converterModal.classList.add("active");
    });

    // Close converter modal
    closeBtn.addEventListener("click", () => {
        converterModal.classList.remove("active");
    });

    // Close on background click
    converterModal.addEventListener("click", (e) => {
        if (e.target === converterModal) {
            converterModal.classList.remove("active");
        }
    });

    // Handle file selection
    fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await file.text();
            textInput.value = content;
            updateOutput();
        } catch (error) {
            showError("Failed to read file: " + error.message);
        }
    });

    // Handle text input changes
    textInput.addEventListener("input", updateOutput);

    // Update output and stats
    function updateOutput() {
        const m3uContent = textInput.value.trim();

        // Update character count
        if (charCount) {
            charCount.textContent = m3uContent.length.toLocaleString();
        }

        if (!m3uContent) {
            outputCode.textContent = "// Paste M3U8 content above or select a file";
            downloadBtn.disabled = true;
            if (channelCount) channelCount.textContent = "0";
            return;
        }

        try {
            const jsCode = convertM3UToJavaScript(m3uContent);
            outputCode.textContent = jsCode;
            downloadBtn.disabled = false;

            // Show channel count
            const count = jsCode.match(/CHANNEL_COUNT = (\d+)/);
            if (channelCount && count) {
                channelCount.textContent = count[1];
            }
        } catch (error) {
            showError("Conversion error: " + error.message);
            downloadBtn.disabled = true;
        }
    }

    // Download generated module
    downloadBtn.addEventListener("click", () => {
        const code = outputCode.textContent;
        if (!code || code.startsWith("//")) {
            showError("No valid code to download");
            return;
        }

        try {
            const blob = new Blob([code], { type: "text/javascript;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "playlist.js";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log("Playlist downloaded successfully");
        } catch (error) {
            showError("Download failed: " + error.message);
        }
    });

    // Show error message
    function showError(message) {
        outputCode.textContent = `// Error: ${message}`;
        downloadBtn.disabled = true;
    }
}
