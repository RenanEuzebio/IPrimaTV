/**
 * Channel List Component
 * Handles channel list rendering and search functionality
 */

import { playStream } from '../services/player.js';

// Module-level state
let allChannels = [];

/**
 * Initialize the channel list with data
 * @param {Array} channels - Array of channel objects
 */
export function initChannelList(channels) {
    allChannels = channels;
    renderChannelList(channels);
}

/**
 * Render the channel list in the UI
 * @param {Array} channels - Array of channel objects to render
 */
export function renderChannelList(channels) {
    const div = document.getElementById("channels");

    if (!div) {
        console.error("Channels container not found");
        return;
    }

    div.innerHTML = "";

    if (channels.length === 0) {
        div.innerHTML = '<div class="error-message">No channels found.</div>';
        return;
    }

    channels.forEach(ch => {
        const item = document.createElement("div");
        item.className = "channel";
        item.onclick = () => playStream(ch.url);

        // Add channel logo if available
        if (ch.logo) {
            const img = document.createElement("img");
            img.src = ch.logo;
            img.alt = ch.name;
            img.onerror = () => { img.style.display = 'none'; };
            item.appendChild(img);
        }

        // Create text container
        const textWrap = document.createElement("div");
        textWrap.className = "channel-text";

        // Channel name
        const nameEl = document.createElement("div");
        nameEl.className = "channel-name";
        nameEl.textContent = ch.name || ch.url;
        textWrap.appendChild(nameEl);

        // Channel group
        if (ch.group) {
            const groupEl = document.createElement("div");
            groupEl.className = "channel-group";
            groupEl.textContent = ch.group;
            textWrap.appendChild(groupEl);
        }

        item.appendChild(textWrap);
        div.appendChild(item);
    });
}

/**
 * Setup the search input functionality
 */
export function setupSearch() {
    const input = document.getElementById("search");

    if (!input) {
        console.warn("Search input not found");
        return;
    }

    input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        const filtered = q
            ? allChannels.filter(ch => {
                const name = (ch.name || "").toLowerCase();
                const group = (ch.group || "").toLowerCase();
                return name.includes(q) || group.includes(q);
              })
            : allChannels;

        renderChannelList(filtered);
    });
}
