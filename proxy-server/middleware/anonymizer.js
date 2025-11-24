const config = require('../config');

/**
 * Get a random user agent from the pool
 */
function getRandomUserAgent() {
  const userAgents = config.userAgents;
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Strip identifying headers from the request
 */
function stripHeaders(headers) {
  const cleanHeaders = { ...headers };
  const headersToStrip = config.headersToStrip.map(h => h.toLowerCase());

  // Remove all headers in the strip list
  for (const header of headersToStrip) {
    delete cleanHeaders[header];
  }

  return cleanHeaders;
}

/**
 * Build anonymized headers for proxied request
 */
function buildAnonymizedHeaders(originalHeaders, targetUrl) {
  let headers = {};

  // Only preserve specific headers needed for streaming
  const preservedHeaders = config.headersToPreserve.map(h => h.toLowerCase());

  for (const [key, value] of Object.entries(originalHeaders)) {
    const lowerKey = key.toLowerCase();
    if (preservedHeaders.includes(lowerKey)) {
      headers[key] = value;
    }
  }

  // Set anonymized User-Agent
  if (config.anonymity.rotateUserAgent) {
    headers['User-Agent'] = getRandomUserAgent();
  } else if (originalHeaders['user-agent']) {
    headers['User-Agent'] = originalHeaders['user-agent'];
  } else {
    headers['User-Agent'] = getRandomUserAgent(); // Fallback
  }

  // Set generic Accept headers if not present
  if (!headers['Accept']) {
    headers['Accept'] = '*/*';
  }

  if (!headers['Accept-Encoding']) {
    headers['Accept-Encoding'] = 'gzip, deflate, br';
  }

  if (!headers['Accept-Language']) {
    headers['Accept-Language'] = 'en-US,en;q=0.9';
  }

  // Add Connection header
  headers['Connection'] = 'keep-alive';

  // Extract host from target URL
  try {
    const url = new URL(targetUrl);
    headers['Host'] = url.host;
  } catch (error) {
    // If URL parsing fails, don't set Host header
  }

  return headers;
}

/**
 * Add random delay to appear more human-like
 */
async function addRandomDelay() {
  if (config.anonymity.addRandomDelay) {
    const [min, max] = config.anonymity.delayRange;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Express middleware for request anonymization
 */
function anonymizerMiddleware(req, res, next) {
  // Store original headers for reference
  req.originalHeaders = { ...req.headers };

  // Log anonymization if enabled
  if (config.logging.enabled) {
    console.log(`[Anonymizer] Processing request from ${req.ip}`);
  }

  next();
}

module.exports = {
  anonymizerMiddleware,
  getRandomUserAgent,
  stripHeaders,
  buildAnonymizedHeaders,
  addRandomDelay,
};
