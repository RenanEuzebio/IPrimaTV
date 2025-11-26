# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IPrimaTV is a web-based M3U/M3U8 live streaming player (IPTV player) built with zero build tools. The application runs entirely in the browser using ES6 modules, Alpine.js for reactivity, Tailwind CSS for styling, and Material Design 3 for UI components.

## Tech Stack

- **Frontend Framework**: Alpine.js (reactive component model)
- **Styling**: Tailwind CSS + Material Design 3 color palette
- **Video Players**: HLS.js (for .m3u8 streams), mpegts.js (for .ts streams), native HTML5 video (fallback)
- **Module System**: ES6 modules (no bundler, native browser imports)
- **Icons**: Material Symbols (Google Fonts)

## Development Commands

**Local Development:**
```bash
# Serve with any static file server
python -m http.server 8000
# or
npx serve
# or
php -S localhost:8000
```

Then open `http://localhost:8000` in a browser.

**Testing Streams:**
Open the app and use the in-browser playlist converter or manually test channels from `js/data/playlist.js`.

## Architecture Overview

### No Build Step
This project intentionally avoids build tools (webpack, vite, etc.). All code runs directly in the browser:
- ES6 modules loaded via `<script type="module">`
- Tailwind CSS via Play CDN
- Alpine.js via CDN
- External player libraries via CDN

### Module Structure

```
js/
├── app.js                    # Alpine.js main component (window.appData)
├── data/
│   └── playlist.js          # Channel data (CHANNELS, CHANNEL_GROUPS)
├── services/
│   └── player.js            # Video playback with multi-player fallback
├── components/
│   └── playlistConverter.js # M3U → JS converter
└── utils/
    └── parser.js            # M3U parsing utilities
```

### State Management Pattern

**Alpine.js Component** (`app.js`):
- Exports `window.appData()` function that returns Alpine component object
- All reactive state lives in this component
- Component stores global reference: `window.alpineApp = this`

**Service Communication** (`player.js`):
- Services maintain module-level state (e.g., `hlsInstance`, `tsPlayer`)
- Services call back to Alpine via `window.alpineApp.setStreamStatus()`
- Services are pure ES6 modules with exported functions

### Player Fallback Strategy

The player.js service implements a three-tier fallback strategy for maximum stream compatibility:

1. **Native Video Element**: Try first (best for some servers)
2. **HLS.js**: For .m3u8 streams (if native fails and HLS.js supported)
3. **mpegts.js**: For .ts streams (if above fail)

Each approach is attempted sequentially in `playStream(url)` at js/services/player.js:34.

### Playlist Management Workflow

**Converting M3U Files to JavaScript:**

1. Use the in-browser converter (UI button opens modal)
2. Paste M3U8 content into the converter
3. Copy generated JavaScript code
4. Replace contents of `js/data/playlist.js`

The converter generates a module with:
```javascript
export const CHANNELS = [...];
export const CHANNEL_COUNT = N;
export const CHANNEL_GROUPS = [...];
```

**Why JavaScript instead of M3U8:**
- Faster parsing (no runtime parsing overhead)
- Type-safe imports
- Better IDE support
- Easier to version control diffs

## Key Files

- `index.html` (lines 1-100): Tailwind config with M3 color system
- `js/app.js`: Alpine component with init, filtering, search, player control
- `js/services/player.js`: Multi-player fallback logic (lines 34-110)
- `js/data/playlist.js`: Large file (~827KB) with channel data
- `js/utils/parser.js`: Pure utility for parsing `#EXTINF` lines

## Common Patterns

**Adding new Alpine.js component methods:**
Edit `js/app.js` and add methods to the returned object in `window.appData()`.

**Modifying player behavior:**
Edit `js/services/player.js`. Remember to clean up previous player instances in `cleanupPlayers()`.

**Updating channel data:**
Use the in-browser converter tool or directly edit `js/data/playlist.js` (must maintain export structure).

**Adding UI components:**
Edit `index.html`. Follow Material Design 3 patterns (use existing components as reference). Use Alpine.js directives (`x-data`, `x-show`, `@click`, etc.).

## Material Design 3 Conventions

- Use semantic color tokens: `primary`, `secondary`, `tertiary`, `surface`, `on-surface`, etc.
- Elevation via `shadow-elevation-{1,2,3}` classes
- Border radius: `rounded-{xs,sm,md,lg,xl,full}` for M3 shapes
- Transitions: `transition-m3-{standard,emphasized}` timing functions
- Icons: Material Symbols with `material-symbols-outlined` class

## Git Workflow

This project uses custom Claude Code skills for commits and PRs:
- `commit-generator-cskill`: Generates commit messages
- `pr-creator-cskill`: Creates GitHub pull requests

## Important Notes

- **No package.json**: This is intentional. No npm dependencies.
- **Large playlist.js**: The data file can be very large (hundreds of KB). This is normal for IPTV playlists.
- **CORS Issues**: Some streams may fail due to CORS. This is a server-side issue, not an app bug.
- **Source M3U files ignored**: `.gitignore` excludes `*.m3u8` files (use converter to generate JS).
