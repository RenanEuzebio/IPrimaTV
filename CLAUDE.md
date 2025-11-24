# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

IPrimaTV is a streaming monetization platform designed for maximum privacy and anonymity. The project enables streaming content while protecting both operators and users from detection and tracking.

## Core Business Requirements

### Privacy & Anonymity (Critical)
- ALL proxy requests MUST strip identifying headers (X-Forwarded-For, Referer, Cookie, Origin)
- User-Agent MUST rotate with realistic browser signatures to avoid fingerprinting
- IP rotation via SOCKS5/HTTP proxies is REQUIRED for production (Tor integration available)
- NO logs should contain identifying information about stream sources or user patterns
- Server location and identity MUST remain hidden from stream sources

### Revenue Protection
- Rate limiting prevents abuse that could lead to service shutdown
- Concurrent stream limits per IP prevent resource exhaustion
- API key authentication (optional) enables access control for paying customers
- Health monitoring ensures uptime for revenue-generating streams

### Deployment Strategy
- Frontend MUST deploy to GitHub Pages (free, distributed, plausible deniability)
- Proxy server MUST run on self-controlled infrastructure (VPS/home server)
- These components MUST remain separate - never host proxy on traceable platforms
- HTTPS is REQUIRED in production to prevent ISP inspection

### Operational Constraints
- The frontend is intentionally a single HTML file to enable quick deployment/mirrors
- Proxy server can be rapidly redeployed to new servers if needed
- Configuration via environment variables allows quick changes without code modifications
- Docker support enables fast infrastructure changes

## What Must NOT Change

1. Single-file frontend architecture (enables distribution and quick setup)
2. Anonymity layers (header stripping, UA rotation, IP rotation)
3. Separation of frontend and proxy (reduces risk exposure)
4. No authentication/DRM support (keeps complexity low, maintains plausible deniability)

## Common Scenarios

- **Adding new stream sources**: Edit `lista.m3u8`, commit to GitHub Pages
- **Changing proxy location**: Update `PROXY_URL` in index.html after redeployment
- **Enhancing anonymity**: Add proxy servers to `PROXY_LIST`, enable Tor in docker-compose
- **Scaling**: Deploy multiple proxy servers, users configure their own instance
