'use strict';

const MCAS_SUFFIX = '.mcas.ms';

// Extracts the destination from a mcas-proxyweb.mcas.ms interception URL,
// strips the .mcas.ms proxy hostname suffix and MCAS tracking params, and
// returns the cleaned redirect target, or null if anything is missing or invalid.
function bypassMcasProxy(interceptedUrl) {
  let proxyUrl;
  try {
    proxyUrl = new URL(interceptedUrl);
  } catch {
    return null;
  }

  const encodedOriginalUrl = proxyUrl.searchParams.get('originalUrl');
  if (!encodedOriginalUrl) return null;

  let originalUrl;
  try {
    originalUrl = new URL(decodeURIComponent(encodedOriginalUrl));
  } catch {
    return null;
  }

  // Only handle standard web URLs — guard against javascript: and similar schemes.
  if (originalUrl.protocol !== 'https:' && originalUrl.protocol !== 'http:') return null;

  if (originalUrl.hostname.endsWith(MCAS_SUFFIX)) {
    const original = originalUrl.hostname.slice(0, -MCAS_SUFFIX.length);
    // Require at least one dot so the result is a real registrable domain.
    if (!original.includes('.')) return null;
    originalUrl.hostname = original;
  }

  // Drop MCAS-injected tracking params (McasTsid, McasCSRF, …).
  for (const key of [...originalUrl.searchParams.keys()]) {
    if (/^Mcas/i.test(key)) originalUrl.searchParams.delete(key);
  }

  return originalUrl.href;
}

// Guard allows the module to be imported in Node.js for unit testing.
if (typeof browser !== 'undefined') {
  const bypassedUrls = [];

  browser.browserAction.setBadgeBackgroundColor({ color: '#1565C0' });

  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      const cleanedUrl = bypassMcasProxy(details.url);
      if (!cleanedUrl) return {};

      bypassedUrls.push(cleanedUrl);
      browser.browserAction.setBadgeText({ text: String(bypassedUrls.length) });
      return { redirectUrl: cleanedUrl };
    },
    { urls: ['*://mcas-proxyweb.mcas.ms/*'] },
    ['blocking']
  );

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'getBypassedUrls') {
      return Promise.resolve([...bypassedUrls].reverse());
    }
  });
}

if (typeof module !== 'undefined') module.exports = { bypassMcasProxy };
