const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const config = require('../config');

// Proxy rotation state
let currentProxyIndex = 0;
const proxyHealthStatus = new Map(); // Track proxy health

/**
 * Parse proxy URL and determine type
 */
function parseProxyUrl(proxyUrl) {
  try {
    const url = new URL(proxyUrl);
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port || (url.protocol === 'socks5:' ? 1080 : 8080),
      username: url.username || null,
      password: url.password || null,
      url: proxyUrl,
    };
  } catch (error) {
    console.error(`[IP Rotator] Invalid proxy URL: ${proxyUrl}`, error.message);
    return null;
  }
}

/**
 * Create proxy agent based on protocol
 */
function createProxyAgent(proxyUrl) {
  const proxyInfo = parseProxyUrl(proxyUrl);

  if (!proxyInfo) {
    return null;
  }

  try {
    if (proxyInfo.protocol === 'socks' || proxyInfo.protocol === 'socks5') {
      console.log(`[IP Rotator] Creating SOCKS5 proxy agent: ${proxyInfo.host}:${proxyInfo.port}`);
      return new SocksProxyAgent(proxyUrl);
    } else if (proxyInfo.protocol === 'http' || proxyInfo.protocol === 'https') {
      console.log(`[IP Rotator] Creating HTTP(S) proxy agent: ${proxyInfo.host}:${proxyInfo.port}`);
      return new HttpsProxyAgent(proxyUrl);
    } else {
      console.error(`[IP Rotator] Unsupported proxy protocol: ${proxyInfo.protocol}`);
      return null;
    }
  } catch (error) {
    console.error(`[IP Rotator] Failed to create proxy agent:`, error.message);
    return null;
  }
}

/**
 * Get next proxy using configured rotation strategy
 */
function getNextProxy() {
  if (!config.proxyRotation.enabled || config.proxyRotation.proxies.length === 0) {
    return null;
  }

  const proxies = config.proxyRotation.proxies;
  let selectedProxy;

  if (config.proxyRotation.rotationStrategy === 'random') {
    // Random selection
    const randomIndex = Math.floor(Math.random() * proxies.length);
    selectedProxy = proxies[randomIndex];
  } else {
    // Round-robin selection
    selectedProxy = proxies[currentProxyIndex];
    currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  }

  // Check if proxy is marked as unhealthy
  const healthStatus = proxyHealthStatus.get(selectedProxy);
  if (healthStatus && healthStatus.failedAt && Date.now() - healthStatus.failedAt < 60000) {
    // Proxy failed recently (within 1 minute), skip to next
    console.log(`[IP Rotator] Skipping unhealthy proxy: ${selectedProxy}`);
    if (config.proxyRotation.rotationStrategy === 'round-robin') {
      return getNextProxy(); // Recursively get next proxy
    }
  }

  return selectedProxy;
}

/**
 * Mark proxy as failed
 */
function markProxyFailed(proxyUrl) {
  proxyHealthStatus.set(proxyUrl, {
    failedAt: Date.now(),
    healthy: false,
  });
  console.log(`[IP Rotator] Marked proxy as failed: ${proxyUrl}`);
}

/**
 * Mark proxy as healthy
 */
function markProxyHealthy(proxyUrl) {
  proxyHealthStatus.set(proxyUrl, {
    healthy: true,
    lastSuccess: Date.now(),
  });
}

/**
 * Get proxy agent for axios request
 */
function getProxyAgent() {
  const proxyUrl = getNextProxy();

  if (!proxyUrl) {
    return null;
  }

  const agent = createProxyAgent(proxyUrl);

  if (agent) {
    console.log(`[IP Rotator] Using proxy: ${proxyUrl}`);
  }

  return { agent, proxyUrl };
}

/**
 * Test proxy connectivity
 */
async function testProxy(proxyUrl) {
  const axios = require('axios');
  const agent = createProxyAgent(proxyUrl);

  if (!agent) {
    return false;
  }

  try {
    const response = await axios.get('https://www.google.com', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 5000,
      validateStatus: () => true,
    });

    if (response.status === 200) {
      console.log(`[IP Rotator] Proxy test successful: ${proxyUrl}`);
      markProxyHealthy(proxyUrl);
      return true;
    }
  } catch (error) {
    console.error(`[IP Rotator] Proxy test failed: ${proxyUrl}`, error.message);
    markProxyFailed(proxyUrl);
  }

  return false;
}

/**
 * Test all configured proxies
 */
async function testAllProxies() {
  if (!config.proxyRotation.enabled || config.proxyRotation.proxies.length === 0) {
    console.log('[IP Rotator] No proxies configured');
    return;
  }

  console.log('[IP Rotator] Testing all configured proxies...');

  const results = await Promise.allSettled(
    config.proxyRotation.proxies.map(proxy => testProxy(proxy))
  );

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  console.log(`[IP Rotator] Proxy test results: ${successCount}/${config.proxyRotation.proxies.length} healthy`);
}

/**
 * Express middleware for IP rotation
 */
function ipRotatorMiddleware(req, res, next) {
  if (config.proxyRotation.enabled) {
    // Attach proxy agent getter to request
    req.getProxyAgent = getProxyAgent;
  }
  next();
}

module.exports = {
  ipRotatorMiddleware,
  getProxyAgent,
  markProxyFailed,
  markProxyHealthy,
  testAllProxies,
};
