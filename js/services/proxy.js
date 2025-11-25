/**
 * Proxy Service
 * Handles CORS proxy testing and URL generation for streaming
 */

import { CORS_PROXIES } from '../config/constants.js';

/**
 * Generate a proxied URL using the specified proxy
 * @param {string} url - Original URL to proxy
 * @param {number} proxyIndex - Index of proxy in CORS_PROXIES array
 * @returns {string} Proxied URL or original if index out of range
 */
export function getProxiedUrl(url, proxyIndex = 0) {
    if (proxyIndex >= CORS_PROXIES.length) return url;

    const proxy = CORS_PROXIES[proxyIndex];

    // Handle different proxy formats
    if (proxy.includes("codetabs.com")) {
        return proxy + encodeURIComponent(url);
    }

    return proxy + url;
}

/**
 * Test all proxies to find one that works for the given URL
 * @param {string} url - URL to test proxy availability for
 * @returns {Promise<number>} Index of working proxy, or -1 if none work
 */
export async function testProxyAvailability(url) {
    console.log("Testing proxy availability for:", url);

    for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
            const testUrl = getProxiedUrl(url, i);
            console.log(`Testing proxy ${i + 1}:`, testUrl);

            const response = await fetch(testUrl, {
                method: 'HEAD',
                mode: 'cors'
            });

            if (response.ok || response.status === 200) {
                console.log(`Proxy ${i + 1} works!`);
                return i;
            }
        } catch (e) {
            console.warn(`Proxy ${i + 1} failed:`, e.message);
        }
    }

    return -1;
}
