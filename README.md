<div align="center">

# 📺 IPrimaTV

### Modern IPTV Player with Zero Dependencies

A beautiful, fast, and lightweight M3U/M3U8 live streaming player built with modern web technologies and Material Design 3.

**No build step • No npm • Pure ES6 modules**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation)

---

</div>

## ✨ Features

### 🎯 Core Capabilities
- **Multi-Format Support** – Seamlessly plays M3U8 (HLS) and MPEG-TS streams
- **Intelligent Fallback** – Three-tier playback strategy (Native → HLS.js → mpegts.js) ensures maximum compatibility
- **In-Browser Converter** – Transform M3U playlists to JavaScript modules without external tools
- **Advanced Search & Filter** – Find channels instantly with real-time search and group filtering
- **Channel Management** – Organize thousands of channels with grouped categories

### 🎨 User Experience
- **Material Design 3** – Beautiful, modern UI following Google's latest design system
- **Dark Theme** – Eye-friendly dark color palette with custom M3 color tokens
- **Responsive Layout** – Seamless experience from mobile to desktop
- **Smart Notifications** – Real-time stream status with auto-dismissing snackbars
- **Channel Logos** – Visual channel identification with automatic fallbacks

### 🚀 Technical Excellence
- **Zero Build Tools** – No webpack, no vite, no bundlers. Pure browser-native ES6 modules
- **Lightweight** – Minimal footprint with CDN-loaded dependencies
- **Fast Loading** – Instant startup with on-demand module loading
- **Modern Stack** – Alpine.js, Tailwind CSS, and cutting-edge web APIs

---

## 📸 Screenshots

> Beautiful Material Design 3 interface with clean, modern aesthetics

**Main Player Interface**
- Clean video player with channel sidebar
- Real-time search and filtering
- Material Design 3 components throughout

**Playlist Converter**
- Drag-and-drop M3U file upload
- Live preview of converted JavaScript
- One-click download

---

## 🚀 Quick Start

### Prerequisites

**None!** Just a modern web browser and a static file server.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/IPrimaTV.git
   cd IPrimaTV
   ```

2. **Serve the files**

   Choose any static file server:

   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve

   # PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

That's it! No `npm install`, no build step, no configuration files.

### Usage

1. **Browse Channels** – Use the sidebar to explore available channels
2. **Search** – Type in the search box to filter channels by name or group
3. **Filter by Group** – Select a category from the dropdown menu
4. **Play** – Click any channel to start streaming
5. **Convert Playlists** – Click "Convert Playlist" to import your own M3U files

---

## 🏗️ Architecture

### The Zero-Build Philosophy

IPrimaTV is built on a radical principle: **leverage the browser's native capabilities instead of adding build complexity**.

```
No package.json → No node_modules → No build errors → Just code
```

**How it works:**
- ES6 modules loaded via `<script type="module">`
- Tailwind CSS via Play CDN (JIT compilation in browser)
- Alpine.js via CDN (reactive framework)
- External libraries via CDN (HLS.js, mpegts.js)

### Multi-Player Fallback Strategy

The player uses a sophisticated three-tier fallback system for maximum stream compatibility:

```javascript
// js/services/player.js:34-110

1. Native HTML5 Video Element
   ↓ (if fails)
2. HLS.js (for .m3u8 streams)
   ↓ (if fails)
3. mpegts.js (for .ts streams)
```

This ensures that if one playback method fails (e.g., due to browser limitations or stream encoding), the system automatically tries the next approach.

### Module Structure

```
IPrimaTV/
├── index.html                 # Single-page application shell
├── js/
│   ├── app.js                # Alpine.js main component (window.appData)
│   ├── data/
│   │   └── playlist.js       # Channel data (ES6 module export)
│   ├── services/
│   │   └── player.js         # Video playback with multi-player fallback
│   ├── components/
│   │   └── playlistConverter.js  # M3U → JavaScript converter
│   └── utils/
│       └── parser.js         # M3U parsing utilities
└── favicon.ico
```

### State Management Pattern

**Alpine.js Component** (js/app.js:11):
- Single global component exposed as `window.appData()`
- All reactive state lives in this component
- Component stores reference: `window.alpineApp = this`

**Service Communication**:
- Services maintain module-level state (e.g., `hlsInstance`, `tsPlayer`)
- Services call back to Alpine via `window.alpineApp.setStreamStatus()`
- Pure functional approach with ES6 module exports

---

## 📚 Documentation

### Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Alpine.js** | Reactive component model | 3.x |
| **Tailwind CSS** | Utility-first CSS framework | 3.x (Play CDN) |
| **Material Design 3** | Design system & color tokens | Custom theme |
| **HLS.js** | HTTP Live Streaming playback | Latest |
| **mpegts.js** | MPEG-TS stream playback | Latest |
| **Material Symbols** | Icon library | Google Fonts |

### File Structure Deep Dive

#### `index.html` (1-521)
- **Lines 20-96**: Tailwind configuration with M3 color system
- **Lines 102-147**: Custom M3 styling (scrollbars, state layers, transitions)
- **Lines 149-295**: Sidebar with search, filter, and channel list
- **Lines 298-340**: Main content area with video player
- **Lines 368-498**: Converter modal (full-screen dialog)
- **Lines 501-519**: Alpine.js bootstrap script

#### `js/app.js`
Core Alpine.js component with methods:
- `init()` – Initialize app, store global reference
- `filterChannels()` – Real-time search and group filtering
- `selectGroup(group)` – Category selection
- `playChannel(channel)` – Trigger stream playback
- `setStreamStatus(message)` – Update UI notifications (called from player.js)
- `convertPlaylist()` – M3U to JavaScript conversion
- `downloadPlaylist()` – Generate and download converted file

#### `js/services/player.js`
Multi-player fallback implementation:
- `playStream(url)` – Main entry point with three-tier fallback
- `cleanupPlayers()` – Destroy previous player instances
- HLS.js and mpegts.js instance management
- Error handling with Alpine.js callbacks

#### `js/data/playlist.js`
Large data file (~827KB typical) with structure:
```javascript
export const CHANNELS = [
  { name: "...", url: "...", logo: "...", group: "..." },
  // ... thousands of channels
];
export const CHANNEL_COUNT = 1234;
export const CHANNEL_GROUPS = ["Sports", "News", ...];
```

### Material Design 3 Implementation

**Color System** (index.html:24-72):
- Primary/Secondary/Tertiary tonal palettes
- Surface hierarchy (dim, bright, container levels)
- Error states
- Inverse colors for contrast

**Components**:
- Outlined text fields
- Exposed dropdown menus
- Elevated buttons
- Full-screen dialogs
- Snackbars with auto-dismiss

**Elevation**:
```css
shadow-elevation-1  /* 0-1px blur for slight lift */
shadow-elevation-2  /* 2-6px blur for cards */
shadow-elevation-3  /* 4-8px blur for dialogs */
```

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |

**Requirements:**
- ES6 module support (`<script type="module">`)
- CSS Grid & Flexbox
- Async/await
- Fetch API

---

## 🔧 Development Guide

### Local Development

1. **Serve the project** with any static server
2. **Make changes** to files directly (hot reload depends on your server)
3. **Test in browser** – no compilation needed

### Adding Features

**Adding Alpine.js methods:**
Edit `js/app.js` and add methods to the returned object in `window.appData()`:

```javascript
window.appData = function() {
    return {
        // ... existing state

        myNewMethod() {
            // Your code here
        }
    };
};
```

**Modifying player behavior:**
Edit `js/services/player.js` at js/services/player.js:34. Remember to clean up previous player instances in `cleanupPlayers()`.

**Updating UI:**
Edit `index.html`. Follow Material Design 3 patterns. Use Alpine.js directives:
- `x-data` – Define component
- `x-show` – Conditional rendering
- `@click` – Event handlers
- `x-text` – Text binding
- `x-model` – Two-way binding

### Modifying Styles

**Tailwind classes** are available globally via Play CDN. Custom M3 tokens:

```html
<!-- Colors -->
<div class="bg-primary text-on-primary">
<div class="bg-surface-container text-on-surface">

<!-- Elevation -->
<div class="shadow-elevation-2">

<!-- Border radius (M3 shapes) -->
<div class="rounded-xs">  <!-- 4px -->
<div class="rounded-md">  <!-- 12px -->
<div class="rounded-full"> <!-- pill shape -->
```

---

## 📝 Playlist Management

### Using the Converter (Recommended)

1. Click **"Convert Playlist"** button in the top-right
2. **Select an M3U/M3U8 file** or paste content directly
3. Preview the generated JavaScript code
4. Click **"Download playlist.js"**
5. Replace `js/data/playlist.js` with your downloaded file
6. Refresh the app

**Why JavaScript instead of M3U?**
- ⚡ **10-100x faster parsing** (no runtime parsing overhead)
- 🔍 **Type-safe imports** with IDE autocomplete
- 📦 **Better version control** (readable diffs in Git)
- 🐛 **Easier debugging** (syntax errors caught immediately)

### Manual Editing

Edit `js/data/playlist.js` directly. Maintain this structure:

```javascript
export const CHANNELS = [
    {
        name: "Channel Name",
        url: "https://stream-url.com/playlist.m3u8",
        logo: "https://logo-url.com/logo.png",
        group: "Category Name"
    },
    // ... more channels
];

export const CHANNEL_COUNT = CHANNELS.length;

export const CHANNEL_GROUPS = [...new Set(CHANNELS.map(c => c.group))];
```

### M3U Format Reference

The parser (js/utils/parser.js) understands standard M3U format:

```
#EXTM3U
#EXTINF:-1 tvg-logo="logo.png" group-title="Sports",ESPN
https://stream.example.com/espn.m3u8
#EXTINF:-1 tvg-logo="logo2.png" group-title="News",CNN
https://stream.example.com/cnn.m3u8
```

---

## 🐛 Troubleshooting

### Common Issues

**Streams won't play:**
- ✅ Check if the stream URL is accessible (CORS policies may block some streams)
- ✅ Try a different browser (some codecs aren't universally supported)
- ✅ Verify the stream is online (many IPTV streams have uptime issues)

**Converter not working:**
- ✅ Ensure M3U file is properly formatted (`#EXTM3U` header required)
- ✅ Check browser console for parsing errors
- ✅ Try pasting content directly instead of file upload

**Sidebar not showing:**
- ✅ Click the "Show" button in the top-left
- ✅ Check browser width (may be collapsed on mobile)

**Logo images not displaying:**
- ✅ Verify logo URLs are valid and accessible
- ✅ Check for CORS restrictions (some image hosts block cross-origin requests)
- ✅ Fallback icon will display automatically if image fails

### CORS Issues

Some streams may fail due to CORS policies. This is a **server-side limitation**, not an app bug. Solutions:

1. Use a CORS proxy (for testing only)
2. Find alternative stream sources
3. Run a local proxy server
4. Contact stream provider about CORS headers

---

## 🤝 Contributing

Contributions are welcome! This project follows these principles:

1. **No build tools** – Keep the zero-dependency philosophy
2. **Material Design 3** – Follow M3 guidelines for UI changes
3. **Browser-native** – Prefer web standards over libraries
4. **Minimal complexity** – Simple solutions over clever abstractions

### Development Workflow

```bash
# Fork and clone
git clone https://github.com/yourusername/IPrimaTV.git
cd IPrimaTV

# Create feature branch
git checkout -b feature/my-feature

# Make changes and test locally
python -m http.server 8000

# Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# Open pull request
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Alpine.js** – Lightweight reactive framework
- **Tailwind CSS** – Utility-first CSS framework
- **Material Design 3** – Design system by Google
- **HLS.js** – Open-source HLS player
- **mpegts.js** – MPEG-TS stream support
- **Video.js community** – Inspiration for player patterns

---

## 🔗 Links

- [Alpine.js Documentation](https://alpinejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Material Design 3](https://m3.material.io/)
- [HLS.js GitHub](https://github.com/video-dev/hls.js/)
- [Report Issues](https://github.com/yourusername/IPrimaTV/issues)

---

<div align="center">

**Built with ❤️ using zero build tools**

⭐ Star this repo if you find it useful!

</div>
