# MCAS Proxy Bypass

A Firefox extension that intercepts Microsoft MCAS (Defender for Cloud Apps) proxy redirects and sends you directly to the original URL instead.

## The problem

When your organisation uses Microsoft MCAS, clicking external links in Outlook or Teams opens them through a proxy like:

```
https://mcas-proxyweb.mcas.ms/certificate-checker?...&originalUrl=https%3A%2F%2Fapp.example.com.mcas.ms%2F...
```

This breaks password managers and routes your traffic through Microsoft's inspection proxy.

## What the extension does

It intercepts requests to `mcas-proxyweb.mcas.ms` before they reach Microsoft's servers, extracts the original destination URL, strips the `.mcas.ms` proxy suffix and any MCAS tracking parameters, and redirects you there directly. No data is ever sent to MCAS.

A counter in the toolbar icon shows how many redirects have been bypassed in the current session.

### Pinning the toolbar icon

After installation the icon sits in the Extensions overflow menu and is not visible by default:

1. Click the **puzzle piece** icon (Extensions) in the Firefox toolbar
2. Find **MCAS Proxy Bypass** in the list
3. Click the **pin** icon next to it

The icon will now appear in the toolbar permanently and the bypass counter will be visible at a glance.

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
