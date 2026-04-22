# MCAS Proxy Bypass

A Firefox extension that intercepts Microsoft MCAS (Defender for Cloud Apps) proxy redirects and sends you directly to the original URL instead.

## The problem

When your organisation uses Microsoft MCAS, clicking external links in Outlook or Teams opens them through a proxy like:

```
https://mcas-proxyweb.mcas.ms/certificate-checker?...&originalUrl=https%3A%2F%2Fapp.example.com.mcas.ms%2F...
```

This breaks password managers and routes your traffic through Microsoft's inspection proxy.

## What the extension does

It intercepts requests to `mcas-proxyweb.mcas.ms`, extracts the original destination URL, strips the `.mcas.ms` proxy suffix and any MCAS tracking parameters, and redirects you there directly.

## Installation

### Temporary (for testing)

1. Open `about:debugging` in Firefox
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json`

### Permanent

Submit to [addons.mozilla.org](https://addons.mozilla.org) or sign with `web-ext`:

```sh
npx web-ext sign --api-key=... --api-secret=...
```

## Development

Run the tests (requires Node.js 18+):

```sh
npm test
```

Run in a temporary Firefox profile:

```sh
npx web-ext run
```
