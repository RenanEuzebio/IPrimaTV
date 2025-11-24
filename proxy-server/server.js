const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');
const { anonymizerMiddleware, buildAnonymizedHeaders, addRandomDelay } = require('./middleware/anonymizer');
const { ipRotatorMiddleware, getProxyAgent, markProxyFailed, markProxyHealthy, testAllProxies } = require('./middleware/ipRotator');

const app = express();

// Trust proxy if behind reverse proxy (Nginx)
if (config.server.trustProxy) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors(config.cors));

// Logging middleware
if (config.logging.enabled) {
  app.use(morgan(config.logging.level));
}

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Custom middleware
app.use(anonymizerMiddleware);
app.use(ipRotatorMiddleware);

// Track concurrent streams per IP
const activeStreams = new Map();

/**
 * Validate target URL against allowed/blocked patterns
 */
function validateUrl(url) {
  // Check blocked patterns
  if (config.security.blockedUrlPatterns.length > 0) {
    for (const pattern of config.security.blockedUrlPatterns) {
      if (url.includes(pattern)) {
        return { valid: false, reason: 'URL matches blocked pattern' };
      }
    }
  }

  // Check allowed patterns (if any configured)
  if (config.security.allowedUrlPatterns.length > 0) {
    let allowed = false;
    for (const pattern of config.security.allowedUrlPatterns) {
      if (url.includes(pattern)) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      return { valid: false, reason: 'URL does not match allowed patterns' };
    }
  }

  return { valid: true };
}

/**
 * Check concurrent stream limits
 */
function checkStreamLimit(clientIp) {
  const streams = activeStreams.get(clientIp) || [];
  const now = Date.now();

  // Clean up old streams
  const activeStreamList = streams.filter(s => now - s.startTime < config.streamRateLimit.maxStreamDuration);

  if (activeStreamList.length >= config.streamRateLimit.maxConcurrentStreams) {
    return false;
  }

  return true;
}

/**
 * Register active stream
 */
function registerStream(clientIp) {
  const streams = activeStreams.get(clientIp) || [];
  streams.push({ startTime: Date.now() });
  activeStreams.set(clientIp, streams);
}

/**
 * Unregister stream
 */
function unregisterStream(clientIp) {
  const streams = activeStreams.get(clientIp) || [];
  if (streams.length > 0) {
    streams.shift(); // Remove oldest stream
  }
  if (streams.length === 0) {
    activeStreams.delete(clientIp);
  } else {
    activeStreams.set(clientIp, streams);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    proxyRotation: config.proxyRotation.enabled,
    activeProxies: config.proxyRotation.proxies.length,
  });
});

/**
 * Main proxy endpoint
 */
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  const clientIp = req.ip;

  // Validate URL parameter
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing required parameter: url' });
  }

  // Validate URL
  const urlValidation = validateUrl(targetUrl);
  if (!urlValidation.valid) {
    console.warn(`[Proxy] Blocked URL: ${targetUrl} - ${urlValidation.reason}`);
    return res.status(403).json({ error: urlValidation.reason });
  }

  // Check API key if configured
  if (config.server.apiKey) {
    const providedKey = req.headers['x-api-key'];
    if (providedKey !== config.server.apiKey) {
      console.warn(`[Proxy] Invalid API key from ${clientIp}`);
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
  }

  // Check stream limits
  if (!checkStreamLimit(clientIp)) {
    console.warn(`[Proxy] Stream limit exceeded for ${clientIp}`);
    return res.status(429).json({ error: 'Too many concurrent streams' });
  }

  console.log(`[Proxy] Request from ${clientIp} for: ${targetUrl}`);

  // Register stream
  registerStream(clientIp);

  // Add random delay if configured
  await addRandomDelay();

  // Build anonymized headers
  const proxyHeaders = buildAnonymizedHeaders(req.headers, targetUrl);

  // Prepare axios config
  const axiosConfig = {
    method: 'GET',
    url: targetUrl,
    headers: proxyHeaders,
    responseType: 'stream',
    timeout: 30000,
    validateStatus: () => true, // Accept any status code
  };

  // Add proxy agent if IP rotation is enabled
  let proxyInfo = null;
  if (config.proxyRotation.enabled) {
    proxyInfo = getProxyAgent();
    if (proxyInfo && proxyInfo.agent) {
      axiosConfig.httpAgent = proxyInfo.agent;
      axiosConfig.httpsAgent = proxyInfo.agent;
    }
  }

  try {
    // Make request to target
    const response = await axios(axiosConfig);

    console.log(`[Proxy] Response status: ${response.status} for ${targetUrl}`);

    // Mark proxy as healthy if used
    if (proxyInfo && proxyInfo.proxyUrl) {
      markProxyHealthy(proxyInfo.proxyUrl);
    }

    // Set response status
    res.status(response.status);

    // Copy relevant headers from response
    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'etag',
      'last-modified',
      'transfer-encoding',
    ];

    for (const header of headersToForward) {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    }

    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Accept-Encoding');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');

    // Handle stream cleanup
    req.on('close', () => {
      console.log(`[Proxy] Client disconnected: ${clientIp}`);
      unregisterStream(clientIp);
      response.data.destroy();
    });

    req.on('error', (error) => {
      console.error(`[Proxy] Request error:`, error.message);
      unregisterStream(clientIp);
      response.data.destroy();
    });

    response.data.on('error', (error) => {
      console.error(`[Proxy] Stream error:`, error.message);
      unregisterStream(clientIp);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      }
    });

    // Pipe the response stream
    response.data.pipe(res);

  } catch (error) {
    console.error(`[Proxy] Error proxying request:`, error.message);

    // Mark proxy as failed if used
    if (proxyInfo && proxyInfo.proxyUrl) {
      markProxyFailed(proxyInfo.proxyUrl);
    }

    // Unregister stream
    unregisterStream(clientIp);

    // Send error response
    if (!res.headersSent) {
      if (error.code === 'ECONNABORTED') {
        res.status(504).json({ error: 'Request timeout' });
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        res.status(502).json({ error: 'Unable to reach target server' });
      } else {
        res.status(500).json({
          error: 'Proxy error',
          message: error.message,
        });
      }
    }
  }
});

/**
 * HEAD request support for stream testing
 */
app.head('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).end();
  }

  // Validate URL
  const urlValidation = validateUrl(targetUrl);
  if (!urlValidation.valid) {
    return res.status(403).end();
  }

  // Check API key if configured
  if (config.server.apiKey) {
    const providedKey = req.headers['x-api-key'];
    if (providedKey !== config.server.apiKey) {
      return res.status(401).end();
    }
  }

  try {
    const proxyHeaders = buildAnonymizedHeaders(req.headers, targetUrl);

    const axiosConfig = {
      method: 'HEAD',
      url: targetUrl,
      headers: proxyHeaders,
      timeout: 5000,
      validateStatus: () => true,
    };

    // Add proxy agent if enabled
    if (config.proxyRotation.enabled) {
      const proxyInfo = getProxyAgent();
      if (proxyInfo && proxyInfo.agent) {
        axiosConfig.httpAgent = proxyInfo.agent;
        axiosConfig.httpsAgent = proxyInfo.agent;
      }
    }

    const response = await axios(axiosConfig);
    res.status(response.status).end();
  } catch (error) {
    console.error(`[Proxy] HEAD request error:`, error.message);
    res.status(500).end();
  }
});

/**
 * OPTIONS request for CORS preflight
 */
app.options('/proxy', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Accept-Encoding, X-API-Key');
  res.status(204).end();
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Error handler
 */
app.use((error, req, res, next) => {
  console.error('[Server] Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Start server
 */
async function startServer() {
  // Test proxies if enabled
  if (config.proxyRotation.enabled) {
    await testAllProxies();
  }

  app.listen(config.server.port, config.server.host, () => {
    console.log('\n========================================');
    console.log('IPrimaTV Reverse Proxy Server');
    console.log('========================================');
    console.log(`Server running on: http://${config.server.host}:${config.server.port}`);
    console.log(`CORS Origin: ${config.cors.origin}`);
    console.log(`API Key Required: ${config.server.apiKey ? 'Yes' : 'No'}`);
    console.log(`Proxy Rotation: ${config.proxyRotation.enabled ? 'Enabled' : 'Disabled'}`);
    if (config.proxyRotation.enabled) {
      console.log(`Active Proxies: ${config.proxyRotation.proxies.length}`);
      console.log(`Rotation Strategy: ${config.proxyRotation.rotationStrategy}`);
    }
    console.log(`Rate Limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 1000}s`);
    console.log(`Max Concurrent Streams: ${config.streamRateLimit.maxConcurrentStreams} per IP`);
    console.log('========================================\n');
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});
