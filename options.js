chrome.storage.local.get('blockedSites', ({blockedSites}) => {
  if (blockedSites) {
    document.getElementById('siteList').value = blockedSites.join('\n');
  }
});

document.getElementById('save').addEventListener('click', () => {
  const siteList = document
    .getElementById('siteList')
    .value.split('\n')
    .filter((site) => site.trim() !== '');
  chrome.storage.local.set({blockedSites: siteList});
  chrome.runtime.sendMessage({action: 'updateRules'});
});
