'use strict';

const MCAS_DOMAIN = 'mcas.ms';
const MCAS_ORIGIN = `*://*.${MCAS_DOMAIN}/*`;

// Reload mcas.ms tabs after cookie removal so the user sees a fresh login
// instead of a stale page still holding the deleted session in memory.
function reloadMcasTabs() {
  return browser.tabs.query({ url: MCAS_ORIGIN }).then((tabs) => {
    for (const tab of tabs) browser.tabs.reload(tab.id);
  });
}

// cookie.domain may start with a leading dot for host-only=false cookies;
// browser.cookies.remove needs a full URL built from that hostname + path.
function cookieUrl(cookie) {
  const host = cookie.domain.replace(/^\./, '');
  const scheme = cookie.secure ? 'https' : 'http';
  return `${scheme}://${host}${cookie.path}`;
}

async function deleteMcasCookies() {
  const cookies = await browser.cookies.getAll({ domain: MCAS_DOMAIN });
  await Promise.all(cookies.map((c) =>
    browser.cookies.remove({
      url: cookieUrl(c),
      name: c.name,
      storeId: c.storeId,
      firstPartyDomain: c.firstPartyDomain,
    })
  ));
  return cookies.length;
}

document.getElementById('delete-cookies').addEventListener('click', async () => {
  const button = document.getElementById('delete-cookies');
  const status = document.getElementById('delete-status');
  button.disabled = true;
  status.textContent = '';
  try {
    // permissions.request must be the first await in a user-action handler;
    // it's a no-op (returns true without prompting) once the permission is granted.
    const granted = await browser.permissions.request({ origins: [MCAS_ORIGIN] });
    if (!granted) {
      status.textContent = 'Permission denied.';
      return;
    }
    status.textContent = 'Deleting…';
    const count = await deleteMcasCookies();
    await reloadMcasTabs();
    status.textContent = count === 0
      ? 'No mcas.ms cookies found.'
      : `Deleted ${count} cookie${count === 1 ? '' : 's'}.`;
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
  } finally {
    button.disabled = false;
  }
});

browser.runtime.sendMessage({ type: 'getBypassedUrls' }).then((urls) => {
  if (!urls || urls.length === 0) {
    document.getElementById('empty').hidden = false;
    return;
  }

  const list = document.getElementById('list');
  for (const url of urls) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      browser.tabs.create({ url });
    });
    li.appendChild(a);
    list.appendChild(li);
  }
});
