# IPrimaTV Reverse Proxy Server

Anonymous reverse proxy server for IPrimaTV with CORS support, streaming capabilities, and enhanced anonymity features.

## Features

- **CORS Support**: Enables cross-origin requests from GitHub Pages
- **Streaming Optimized**: Efficient handling of HLS (.m3u8) and MPEG-TS (.ts) live streams
- **Anonymity Features**:
  - Header stripping (removes identifying headers)
  - User-Agent rotation (20+ realistic browser UAs)
  - IP rotation via SOCKS5/HTTP proxies
  - Request rate limiting
- **Security**:
  - Optional API key authentication
  - URL filtering (whitelist/blacklist)
  - Rate limiting per IP
  - Concurrent stream limits
- **Production Ready**:
  - Docker containerization
  - Nginx reverse proxy configuration
  - SSL/TLS support
  - Health check endpoints
  - Graceful shutdown handling

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your settings
nano .env

# 3. Build and run with Docker Compose
docker-compose up -d

# 4. Check logs
docker-compose logs -f proxy

# 5. Test health check
curl http://localhost:3000/health
```

### Option 2: Node.js Direct

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your settings
nano .env

# 4. Start server
npm start

# For development with auto-reload:
npm run dev
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Basic Configuration
PORT=3000                          # Server port
HOST=0.0.0.0                      # Bind address
CORS_ORIGIN=*                     # GitHub Pages URL or * for all
API_KEY=                          # Optional API key

# Rate Limiting
RATE_LIMIT_MAX=100               # Requests per minute per IP
MAX_CONCURRENT_STREAMS=10        # Concurrent streams per IP

# Proxy Rotation (IP Anonymization)
PROXY_ROTATION_ENABLED=false     # Enable IP rotation
PROXY_LIST=                      # Comma-separated proxy URLs
ROTATION_STRATEGY=round-robin    # round-robin or random

# Anonymity
STRIP_HEADERS=true              # Remove identifying headers
ROTATE_USER_AGENT=true          # Rotate User-Agent per request
```

### Proxy Configuration

#### Using Tor for Maximum Anonymity

```bash
# .env
PROXY_ROTATION_ENABLED=true
PROXY_LIST=socks5://127.0.0.1:9050
```

#### Using Multiple Proxies

```bash
# .env
PROXY_ROTATION_ENABLED=true
PROXY_LIST=socks5://proxy1.com:1080,http://proxy2.com:8080,socks5://user:pass@proxy3.com:1080
ROTATION_STRATEGY=random
```

## Deployment

### Self-Hosted VPS Deployment

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker (optional)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

#### Step 2: Clone and Setup

```bash
# Upload proxy-server directory to VPS
scp -r proxy-server user@your-vps-ip:/home/user/

# SSH into VPS
ssh user@your-vps-ip

# Navigate to directory
cd /home/user/proxy-server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env
```

#### Step 3: Setup as System Service (systemd)

```bash
# Create service file
sudo nano /etc/systemd/system/iprimatv-proxy.service
```

Paste this configuration:

```ini
[Unit]
Description=IPrimaTV Reverse Proxy Server
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/proxy-server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable iprimatv-proxy

# Start service
sudo systemctl start iprimatv-proxy

# Check status
sudo systemctl status iprimatv-proxy

# View logs
sudo journalctl -u iprimatv-proxy -f
```

#### Step 4: Setup Nginx Reverse Proxy with SSL

```bash
# Install Nginx and Certbot
sudo apt-get install nginx certbot python3-certbot-nginx

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/iprimatv-proxy

# Edit domain name in config
sudo nano /etc/nginx/sites-available/iprimatv-proxy
# Change 'your-domain.com' to your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/iprimatv-proxy /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Your proxy is now available at: `https://your-domain.com/`

### Docker Deployment

#### Basic Deployment

```bash
# Start proxy only
docker-compose up -d proxy
```

#### With Tor for Enhanced Anonymity

```bash
# Update .env
PROXY_ROTATION_ENABLED=true
PROXY_LIST=socks5://tor:9050

# Start all services
docker-compose up -d
```

### Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Frontend Integration

Update your GitHub Pages `index.html` to use the new proxy:

```javascript
// OLD: Multiple third-party proxies
const CORS_PROXIES = [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://cors.isomorphic-git.org/",
    "https://thingproxy.freeboard.io/fetch/"
];

// NEW: Your self-hosted proxy
const PROXY_URL = "https://your-domain.com/proxy?url=";

// Updated function
function getProxiedUrl(url) {
    return PROXY_URL + encodeURIComponent(url);
}
```

If using API key authentication:

```javascript
async function playStream(url) {
    const proxiedUrl = PROXY_URL + encodeURIComponent(url);

    const response = await fetch(proxiedUrl, {
        headers: {
            'X-API-Key': 'your-api-key-here'
        }
    });

    // ... rest of your code
}
```

## API Reference

### Endpoints

#### `GET /proxy?url=<stream_url>`

Proxy a stream URL.

**Parameters:**
- `url` (required): URL-encoded stream URL

**Headers:**
- `X-API-Key` (optional): API key if configured

**Example:**
```bash
curl "https://your-domain.com/proxy?url=http%3A%2F%2Fexample.com%2Fstream.m3u8"
```

#### `HEAD /proxy?url=<stream_url>`

Test stream availability without downloading.

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "proxyRotation": true,
  "activeProxies": 3
}
```

## Monitoring

### Check Service Status

```bash
# systemd
sudo systemctl status iprimatv-proxy

# Docker
docker-compose ps
docker-compose logs -f proxy
```

### View Logs

```bash
# systemd
sudo journalctl -u iprimatv-proxy -f

# Docker
docker-compose logs -f

# Nginx
sudo tail -f /var/log/nginx/iprimatv-proxy-access.log
sudo tail -f /var/log/nginx/iprimatv-proxy-error.log
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Troubleshooting

### Stream Not Playing

1. Check server logs for errors
2. Verify CORS_ORIGIN is set correctly
3. Test stream URL directly: `curl -I "stream_url"`
4. Check if API key is required and provided

### Proxy Connection Failed

1. Test proxy connectivity:
   ```bash
   curl --socks5 proxy-host:port https://www.google.com
   ```
2. Check proxy credentials and format
3. Verify firewall rules allow outbound connections

### High Memory Usage

1. Reduce `MAX_CONCURRENT_STREAMS` in .env
2. Add swap space on VPS
3. Monitor with: `docker stats` or `htop`

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test Nginx config
sudo nginx -t
```

## Security Best Practices

1. **Use Strong API Key**: Generate with `openssl rand -hex 32`
2. **Restrict CORS Origin**: Set to your exact GitHub Pages URL
3. **Enable Firewall**: Use `ufw` to allow only necessary ports
4. **Regular Updates**: Keep Node.js, Docker, and OS updated
5. **Monitor Logs**: Watch for abuse patterns
6. **Rate Limiting**: Adjust limits based on your needs
7. **Use HTTPS**: Always use SSL/TLS in production

## Performance Optimization

### Increase Rate Limits

```bash
# .env
RATE_LIMIT_MAX=500
MAX_CONCURRENT_STREAMS=50
```

### Enable Response Caching (Nginx)

Add to nginx.conf location block:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=stream_cache:10m max_size=1g inactive=60m;
proxy_cache stream_cache;
proxy_cache_valid 200 5m;
```

### Use PM2 for Process Management

```bash
npm install -g pm2
pm2 start server.js --name iprimatv-proxy
pm2 startup
pm2 save
```

## License

MIT

## Support

For issues and questions, open an issue on GitHub or refer to the main project documentation.
