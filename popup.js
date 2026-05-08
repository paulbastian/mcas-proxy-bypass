'use strict';

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
