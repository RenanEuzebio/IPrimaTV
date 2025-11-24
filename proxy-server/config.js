require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    apiKey: process.env.API_KEY || null, // Optional API key for authentication
    trustProxy: process.env.TRUST_PROXY === 'true' || false,
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // Set to your GitHub Pages URL in production
    credentials: process.env.CORS_CREDENTIALS === 'true' || false,
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
  },

  // Stream-specific rate limiting
  streamRateLimit: {
    maxConcurrentStreams: parseInt(process.env.MAX_CONCURRENT_STREAMS) || 10,
    maxStreamDuration: parseInt(process.env.MAX_STREAM_DURATION) || 3600000, // 1 hour
  },

  // Proxy rotation configuration
  proxyRotation: {
    enabled: process.env.PROXY_ROTATION_ENABLED === 'true' || false,
    proxies: process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [],
    // Example format: "socks5://127.0.0.1:9050,http://proxy2.com:8080"
    rotationStrategy: process.env.ROTATION_STRATEGY || 'round-robin', // 'round-robin' or 'random'
  },

  // Anonymity features
  anonymity: {
    stripHeaders: process.env.STRIP_HEADERS === 'true' || true,
    rotateUserAgent: process.env.ROTATE_USER_AGENT === 'true' || true,
    addRandomDelay: process.env.ADD_RANDOM_DELAY === 'true' || false,
    delayRange: [100, 500], // Random delay in ms
  },

  // Logging
  logging: {
    enabled: process.env.LOGGING_ENABLED !== 'false',
    level: process.env.LOG_LEVEL || 'combined', // 'combined', 'dev', 'short', 'tiny'
  },

  // Security
  security: {
    allowedUrlPatterns: process.env.ALLOWED_URL_PATTERNS
      ? process.env.ALLOWED_URL_PATTERNS.split(',')
      : [], // Empty = allow all, add patterns to restrict
    blockedUrlPatterns: process.env.BLOCKED_URL_PATTERNS
      ? process.env.BLOCKED_URL_PATTERNS.split(',')
      : [], // Block specific patterns
  },

  // Comprehensive User-Agent pool (realistic browsers)
  userAgents: [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',

    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',

    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',

    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',

    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',

    // Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Firefox on Linux
    'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',

    // Mobile User Agents
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
  ],

  // Headers to strip for anonymity
  headersToStrip: [
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-real-ip',
    'forwarded',
    'via',
    'referer',
    'origin',
    'cookie',
    'set-cookie',
    'authorization',
    'x-requested-with',
    'x-api-key',
  ],

  // Headers to preserve for streaming
  headersToPreserve: [
    'accept',
    'accept-encoding',
    'accept-language',
    'cache-control',
    'connection',
    'range',
    'if-modified-since',
    'if-none-match',
  ],
};
