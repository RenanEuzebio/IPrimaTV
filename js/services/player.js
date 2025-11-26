/**
 * Player Service
 * Manages video playback using HLS.js, mpegts.js, and native video element
 */

// Player instances (module-level state)
let hlsInstance = null;
let tsPlayer = null;

/**
 * Show stream info message via Alpine app
 * @param {string} message - Message to display
 */
function showStreamInfo(message) {
    if (window.alpineApp) {
        window.alpineApp.setStreamStatus(message);
    } else {
        console.log('[Stream]', message);
    }
}

/**
 * Update stream info message via Alpine app
 * @param {string} message - Message to display
 */
function updateStreamInfo(message) {
    showStreamInfo(message);
}

/**
 * Play a stream URL using the appropriate player
 * @param {string} url - Stream URL to play
 */
export async function playStream(url) {
    const video = document.getElementById("video");

    if (!video) {
        console.error("Video element not found");
        return;
    }

    // Clean up previous players
    cleanupPlayers();

    const lower = url.toLowerCase();
    const isM3U8 = lower.includes(".m3u8");
    const isTS = lower.endsWith(".ts");

    console.log("Attempting to play:", { url, isM3U8, isTS });

    // Show loading message
    showStreamInfo(`Loading ${isM3U8 ? 'HLS' : 'TS'} stream...`);

    // Approach 1: Try native video element first (works better for some servers)
    try {
        console.log("Approach 1: Native video element");

        video.src = directUrl;
        video.load();

        const playPromise = video.play();
        if (playPromise !== undefined) {
            await playPromise;
        }

        console.log("Native playback successful!");
        updateStreamInfo("Playing via native player...");
        return;
    } catch (e) {
        console.warn("Native playback failed:", e.message);
    }

    // Approach 2: Try HLS.js for m3u8 streams
    if (isM3U8 && window.Hls && Hls.isSupported()) {
        try {
            console.log("Approach 2: HLS.js");
            updateStreamInfo("Trying HLS.js player...");

            const hlsUrl = url;

            hlsInstance = new Hls({
                liveDurationInfinity: true,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(hlsUrl);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });

            hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                console.warn("HLS error:", data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            updateStreamInfo("Network error - trying alternative method...");
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            updateStreamInfo("Media error - stream may be corrupted");
                            break;
                        default:
                            updateStreamInfo("Fatal HLS error");
                            break;
                    }
                }
            });

            return;
        } catch (e) {
            console.warn("HLS.js failed:", e.message);
        }
    }

    // Approach 3: Try mpegts.js for TS streams
    if (isTS && window.mpegts && mpegts.isSupported()) {
        try {
            console.log("Approach 3: mpegts.js");
            updateStreamInfo("Trying mpegts.js player...");

            const tsUrl = url;

            tsPlayer = mpegts.createPlayer({
                type: "mpegts",
                url: tsUrl,
                isLive: true,
            }, {
                enableWorker: true,
                enableStashBuffer: false, // Disable buffer for live streams
                stashInitialSize: 128 * 1024,
                autoCleanupSourceBuffer: true
            });

            tsPlayer.attachMediaElement(video);
            tsPlayer.load();

            tsPlayer.on(mpegts.Events.ERROR, (type, details, info) => {
                console.warn("mpegts error:", type, details, info || "");
                if (type === mpegts.Events.ERROR) {
                    updateStreamInfo("MPEG-TS playback error");
                }
            });

            video.play().catch(e => console.log("Play failed:", e));
            return;
        } catch (e) {
            console.warn("mpegts.js failed:", e.message);
        }
    }

    // All approaches failed
    updateStreamInfo("Unable to load stream. This may be due to CORS restrictions or the stream being offline.");
}

/**
 * Clean up player instances and reset video element
 */
function cleanupPlayers() {
    const video = document.getElementById("video");

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    if (tsPlayer) {
        tsPlayer.destroy();
        tsPlayer = null;
    }

    if (video) {
        video.onended = null;
        video.src = ''; // Clear previous source
    }
}
