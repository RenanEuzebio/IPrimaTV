# IPrimaTV

A static web-based M3U8/IPTV live stream player with an anonymous reverse proxy server for bypassing CORS restrictions and enhancing privacy.

## 🎯 Overview

IPrimaTV consists of two main components:

1. **Frontend Player** (`index.html`) - A single-page application that parses M3U8 playlists and plays live streams using HLS.js and mpegts.js
2. **Reverse Proxy Server** (`proxy-server/`) - A self-hosted Node.js proxy with anonymity features to bypass CORS and enhance privacy

## ✨ Features

### Frontend Player
- 📺 **Multi-format Support** - Plays HLS (.m3u8) and MPEG-TS (.ts) streams
- 🔍 **Search & Filter** - Find channels by name or group
- 🎨 **Modern UI** - Collapsible sidebar, channel logos, responsive design
- 📱 **Mobile-Friendly** - Works on desktop and mobile browsers
- 🚀 **No Build Required** - Pure vanilla JavaScript, runs directly in browser
- 🌐 **GitHub Pages Ready** - Deploy as static site

### Reverse Proxy Server
- 🔒 **Anonymous Browsing** - Header stripping, User-Agent rotation, IP rotation
- 🌍 **CORS Enabled** - Bypasses cross-origin restrictions
- 🔄 **Streaming Optimized** - Efficient handling of live streams
- 🛡️ **Security Features** - API key auth, rate limiting, URL filtering
- 🐳 **Docker Ready** - Containerized deployment with optional Tor integration
- 📊 **Production Ready** - Nginx config, SSL/TLS, health checks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│                   (index.html)                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  M3U8 Playlist Parser                            │ │
│  │  ↓                                                │ │
│  │  Channel List UI                                 │ │
│  │  ↓                                                │ │
│  │  Video Player (HLS.js / mpegts.js)               │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│              Your VPS (Reverse Proxy)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Nginx (SSL Termination)                         │  │
│  │  ↓                                                │  │
│  │  Node.js Express Server                          │  │
│  │  - Anonymizer (Header/UA rotation)               │  │
│  │  - IP Rotator (SOCKS5/HTTP proxies)              │  │
│  │  - Rate Limiter                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ Anonymized
┌─────────────────────────────────────────────────────────┐
│              Stream Source Servers                       │
│           (HLS/MPEG-TS Live Streams)                     │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Frontend Only (GitHub Pages)

If you just want to test the player with existing CORS proxies:

```bash
# Clone the repository
git clone https://github.com/yourusername/IPrimaTV.git
cd IPrimaTV

# Open in browser (or use a local server)
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Note:** The default configuration uses third-party CORS proxies which may be unreliable. For production use, deploy your own proxy server.

### Option 2: Full Setup (Frontend + Proxy)

For the best experience with anonymity and reliability:

```bash
# 1. Start the proxy server
cd proxy-server
npm install
cp .env.example .env
nano .env  # Configure your settings
npm start

# 2. In another terminal, serve the frontend
cd ..
python3 -m http.server 8000

# 3. Update index.html line 136 to use your proxy:
# const PROXY_URL = "http://localhost:3000/proxy?url=";

# 4. Open http://localhost:8000 in your browser
```

### Option 3: Docker Deployment

```bash
cd proxy-server

# Basic deployment
docker-compose up -d proxy

# With Tor for maximum anonymity
# (First, update .env: PROXY_ROTATION_ENABLED=true, PROXY_LIST=socks5://tor:9050)
docker-compose up -d
```

## 📋 Prerequisites

### For Frontend Only
- Modern web browser with MSE support
- HTTP server (for local testing)

### For Proxy Server
- Node.js 18+ (or Docker)
- VPS or home server (for self-hosting)
- Domain name with DNS configured (for production)
- Optional: Tor or other SOCKS5/HTTP proxies

## 🔧 Configuration

### Frontend Configuration

Edit `index.html` lines 136-143:

```javascript
// Proxy server URL
const PROXY_URL = "https://your-domain.com/proxy?url=";

// Optional API key
const API_KEY = "your-secret-key";

// Toggle proxy usage
const USE_PROXY = true;
```

### Proxy Server Configuration

Edit `proxy-server/.env`:

```bash
# Basic settings
PORT=3000
CORS_ORIGIN=https://yourusername.github.io
API_KEY=your-secret-key-here

# Anonymity features
PROXY_ROTATION_ENABLED=true
PROXY_LIST=socks5://127.0.0.1:9050
STRIP_HEADERS=true
ROTATE_USER_AGENT=true

# Rate limiting
RATE_LIMIT_MAX=100
MAX_CONCURRENT_STREAMS=10
```

See `proxy-server/.env.example` for all available options.

## 📦 Project Structure

```
IPrimaTV/
├── index.html              # Frontend player (SPA)
├── lista.m3u8             # M3U8 playlist file (~730KB)
├── CLAUDE.md              # Development guidelines
├── README.md              # This file
└── proxy-server/          # Reverse proxy server
    ├── server.js          # Main Express server
    ├── config.js          # Configuration & UA pool
    ├── middleware/
    │   ├── anonymizer.js  # Header stripping, UA rotation
    │   └── ipRotator.js   # SOCKS5/HTTP proxy rotation
    ├── package.json       # Node.js dependencies
    ├── Dockerfile         # Docker container
    ├── docker-compose.yml # Docker + Tor setup
    ├── nginx.conf         # Nginx reverse proxy config
    ├── .env.example       # Environment variables
    └── README.md          # Detailed proxy documentation
```

## 🌐 Deployment

### GitHub Pages (Frontend)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Enable GitHub Pages in repository settings
# Settings → Pages → Source: main branch

# 3. Your site will be available at:
# https://yourusername.github.io/IPrimaTV
```

### VPS Deployment (Proxy Server)

See detailed instructions in [`proxy-server/README.md`](proxy-server/README.md):

1. Install Node.js or Docker on your VPS
2. Upload and configure proxy server
3. Setup systemd service or Docker Compose
4. Configure Nginx with SSL/TLS
5. Get Let's Encrypt certificate
6. Update frontend PROXY_URL

**Quick VPS Setup:**

```bash
# On your VPS
cd /home/user
git clone https://github.com/yourusername/IPrimaTV.git
cd IPrimaTV/proxy-server

# Configure
npm install
cp .env.example .env
nano .env

# Run with PM2
npm install -g pm2
pm2 start server.js --name iprimatv-proxy
pm2 startup
pm2 save

# Setup Nginx + SSL (see proxy-server/README.md)
```

## 🔒 Anonymity & Privacy

The proxy server provides multiple layers of anonymity:

### 1. Header Stripping
Automatically removes identifying headers:
- X-Forwarded-For, X-Real-IP
- Referer, Origin, Cookie
- Authorization, User-Agent (replaced)

### 2. User-Agent Rotation
Rotates between 24 realistic browser signatures:
- Chrome, Firefox, Edge, Safari
- Windows, macOS, Linux, Mobile
- Latest versions (auto-updated)

### 3. IP Rotation
Routes requests through SOCKS5/HTTP proxies:
- Tor integration (maximum anonymity)
- Multiple proxy support
- Automatic health checking
- Failover on proxy errors

### 4. Rate Limiting
Mimics human behavior:
- Configurable request limits
- Concurrent stream limits
- Optional random delays

## 🛠️ Development

### Local Development

```bash
# Frontend
python3 -m http.server 8000

# Proxy (with auto-reload)
cd proxy-server
npm run dev
```

### Testing

```bash
# Test proxy health
curl http://localhost:3000/health

# Test proxy endpoint
curl "http://localhost:3000/proxy?url=http%3A%2F%2Fexample.com"

# Test with API key
curl -H "X-API-Key: your-key" "http://localhost:3000/proxy?url=..."
```

## 📊 Monitoring

### Check Proxy Status

```bash
# systemd
sudo systemctl status iprimatv-proxy
sudo journalctl -u iprimatv-proxy -f

# Docker
docker-compose ps
docker-compose logs -f proxy

# PM2
pm2 status
pm2 logs iprimatv-proxy
```

### Health Check

```bash
# Local
curl http://localhost:3000/health

# Production
curl https://your-domain.com/health
```

## 🐛 Troubleshooting

### Streams Not Playing

1. Check browser console for errors
2. Verify proxy server is running
3. Test proxy health endpoint
4. Check CORS_ORIGIN matches your frontend URL
5. Verify API key if configured

### Proxy Connection Issues

1. Check server logs: `docker-compose logs -f proxy`
2. Test proxy connectivity: `curl http://localhost:3000/health`
3. Verify firewall rules allow port 3000 (or 80/443)
4. Check nginx configuration if using reverse proxy

### CORS Errors

1. Ensure CORS_ORIGIN in .env matches frontend domain exactly
2. Check nginx config forwards CORS headers
3. Verify proxy server is accessible from frontend

See [`proxy-server/README.md`](proxy-server/README.md) for more troubleshooting tips.

## 📝 Updating Channel List

Edit `lista.m3u8` with your channels:

```m3u8
#EXTM3U
#EXTINF:-1 group-title="News" tvg-logo="http://example.com/logo.png",Channel Name
http://stream.server.com/channel.m3u8
#EXTINF:-1 group-title="Sports" tvg-logo="http://example.com/logo2.png",Sports Channel
http://stream.server.com/sports.ts
```

Commit and push to update GitHub Pages.

## 🔐 Security Best Practices

1. **Use Strong API Key**: `openssl rand -hex 32`
2. **Restrict CORS Origin**: Set to exact GitHub Pages URL
3. **Enable Firewall**: Allow only necessary ports (22, 80, 443)
4. **Use HTTPS**: Always use SSL/TLS in production
5. **Update Regularly**: Keep Node.js and dependencies updated
6. **Monitor Logs**: Watch for abuse patterns
7. **Rate Limiting**: Adjust based on legitimate usage

## 🚧 Limitations

### GitHub Pages
- Cannot run backend services
- Relies on external proxy (yours or third-party)
- Some streams may fail due to source server restrictions

### Stream Compatibility
- Requires publicly accessible streams
- DRM-protected content not supported
- Some streams may block proxied requests
- Authentication-required streams need special handling

### Browser Requirements
- Requires Media Source Extensions (MSE) support
- Needs modern browser (Chrome, Firefox, Edge, Safari)

## 📚 Documentation

- [Proxy Server Documentation](proxy-server/README.md) - Detailed proxy setup and configuration
- [CLAUDE.md](CLAUDE.md) - Development guidelines and architecture notes

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [HLS.js](https://github.com/video-dev/hls.js/) - HLS playback library
- [mpegts.js](https://github.com/xqq/mpegts.js/) - MPEG-TS playback library
- [Express](https://expressjs.com/) - Web framework for Node.js

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check [proxy-server/README.md](proxy-server/README.md) for detailed troubleshooting
- Review browser console and server logs

## 🔄 Updates

### Version 2.0 (Current)
- Added self-hosted reverse proxy server
- Anonymity features (header stripping, UA rotation, IP rotation)
- Docker support with optional Tor integration
- Production-ready Nginx configuration
- Comprehensive documentation

### Version 1.0
- Initial release with frontend player
- M3U8 playlist parsing
- Multi-format stream support
- Third-party CORS proxy integration

---

**⚠️ Disclaimer**: This tool is for legitimate use with streams you have permission to access. Respect copyright laws and terms of service of streaming providers.
