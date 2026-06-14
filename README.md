# MCAS Proxy Bypass

When your organisation uses Microsoft Defender for Cloud Apps (MCAS), clicking external links in Outlook or Teams opens them through a proxy like `https://mcas-proxyweb.mcas.ms/certificate-checker?...&originalUrl=https%3A%2F%2Fapp.example.com.mcas.ms%2F...`.

This routes your traffic through Microsoft's proxy, acting like a Man-in-the-Middle, leaking data and passwords, as well as breaking password managers. This extension intercepts Microsoft MCAS (Defender for Cloud Apps) proxy redirects and sends you directly to the original URL instead.

Additionally, this extension may help if Outlook and other Microsoft 365 apps get stuck in a state where MCAS keeps logging you out, caused by the `mcas.ms` cookies. This extension supports to easily fix this.

## Feature Set

This extension does the following:

- it intercepts requests to `mcas-proxyweb.mcas.ms` before they reach Microsoft's servers, extracts the original destination URL, strips the `.mcas.ms` proxy suffix and any MCAS tracking parameters, and redirects you there directly (no data is send to MCAS)
- it intercepts requests to `statics.teams.cdn.office.net/.../atp-safelinks.html` before they reach the Microsoft Defender Safe Links page, that is opened by Microsoft Teams, reads the wrapped destination from its `url` query parameter, and redirects you there directly (no separate page is openede and no reputation check is made)
- a counter in the toolbar icon shows how many redirects have been bypassed in the current session
- a scrollable pop-up shows the intercepted links
- a button that removes every cookie on the `mcas.ms` domain (including subdomains like `mcas-proxyweb.mcas.ms`) and reloads any open `mcas.ms` tabs so you land on a fresh login.

## Installation

### Unlisted xpi extension

The extension may be installed permanently as an [unlisted addon (v1.0)](https://addons.mozilla.org/firefox/downloads/file/4850310/b0da8a21afc446ac9d9e-1.0.0.xpi).

### Temporary (for testing)

1. Git clone this repo
2. Open `about:debugging` in Firefox
3. Click **This Firefox** → **Load Temporary Add-on**
4. Select `manifest.json`

## Development

Run the tests (requires Node.js 18+):

```sh
npm test
```

Run in a temporary Firefox profile:

```sh
npx web-ext run
```
