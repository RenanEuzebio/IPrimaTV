/**
 * Main Application - Alpine.js Component
 * M3U Live Player with Material Design 3 UI
 */

import { CHANNELS, CHANNEL_GROUPS } from './data/playlist.js';
import { playStream } from './services/player.js';
import { convertM3UToJavaScript } from './components/playlistConverter.js';

// Expose app data to window for Alpine.js
window.appData = function() {
    return {
        // Channel data
        channels: CHANNELS,
        channelGroups: CHANNEL_GROUPS,
        filteredChannels: [...CHANNELS],

        // UI state
        sidebarOpen: true,
        converterModalOpen: false,
        selectedGroup: 'all',
        searchQuery: '',

        // Player state
        currentChannel: null,
        streamStatus: '',
        isLoading: false,
        hasError: false,

        // Converter state
        converterInput: '',
        converterOutput: '',
        converterChannelCount: 0,

        /**
         * Initialize the application
         */
        init() {
            // Store global reference for player.js
            window.alpineApp = this;

            console.log(`Loaded ${this.channels.length} channels in ${this.channelGroups.length} groups`);

            // Auto-play first channel if available
            if (this.channels.length > 0) {
                this.playChannel(this.channels[0]);
            }
        },

        /**
         * Filter channels by search query and selected group
         */
        filterChannels() {
            const query = this.searchQuery.toLowerCase().trim();
            const group = this.selectedGroup;

            this.filteredChannels = this.channels.filter(channel => {
                // Group filter
                if (group !== 'all' && channel.group !== group) {
                    return false;
                }

                // Search filter
                if (query) {
                    const nameMatch = channel.name.toLowerCase().includes(query);
                    const groupMatch = channel.group.toLowerCase().includes(query);
                    return nameMatch || groupMatch;
                }

                return true;
            });
        },

        /**
         * Select a channel group
         */
        selectGroup(group) {
            this.selectedGroup = group;
            this.filterChannels();
        },

        /**
         * Play a channel
         */
        playChannel(channel) {
            this.currentChannel = channel;
            this.streamStatus = `Loading ${channel.name}...`;

            // Clear status after a delay if successful
            setTimeout(() => {
                if (this.streamStatus.includes('Loading')) {
                    this.streamStatus = '';
                }
            }, 5000);

            playStream(channel.url);
        },

        /**
         * Update stream status (called from player.js)
         */
        setStreamStatus(message) {
            this.streamStatus = message;

            // Auto-hide non-error messages after 4 seconds
            if (!message.toLowerCase().includes('error') && !message.toLowerCase().includes('unable')) {
                setTimeout(() => {
                    if (this.streamStatus === message) {
                        this.streamStatus = '';
                    }
                }, 4000);
            }
        },

        /**
         * Handle file selection in converter
         */
        async handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const content = await file.text();
                this.converterInput = content;
                this.convertPlaylist();
            } catch (error) {
                console.error('Failed to read file:', error);
                this.converterOutput = `// Error: Failed to read file - ${error.message}`;
                this.converterChannelCount = 0;
            }
        },

        /**
         * Convert M3U8 content to JavaScript module
         */
        convertPlaylist() {
            const content = this.converterInput.trim();

            if (!content) {
                this.converterOutput = '';
                this.converterChannelCount = 0;
                return;
            }

            try {
                const jsCode = convertM3UToJavaScript(content);
                this.converterOutput = jsCode;

                // Extract channel count
                const match = jsCode.match(/CHANNEL_COUNT = (\d+)/);
                this.converterChannelCount = match ? parseInt(match[1], 10) : 0;
            } catch (error) {
                console.error('Conversion error:', error);
                this.converterOutput = `// Error: ${error.message}`;
                this.converterChannelCount = 0;
            }
        },

        /**
         * Download the converted playlist
         */
        downloadPlaylist() {
            if (!this.converterOutput || this.converterChannelCount === 0) {
                return;
            }

            try {
                const blob = new Blob([this.converterOutput], { type: 'text/javascript;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'playlist.js';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                console.log('Playlist downloaded successfully');
            } catch (error) {
                console.error('Download failed:', error);
            }
        },
    };
};

// Signal that app is ready
window.appReady = true;
console.log('App module loaded, ready for Alpine.js');
