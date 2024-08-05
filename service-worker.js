chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateState') togglePaused(message.paused);
});

function togglePaused(paused) {
  chrome.storage.local.set({paused: paused});
  if (paused) {
    removeRules().then(() => {
      console.info('Extension paused');
    });
  } else {
    updateRules().then(() => {
      console.info('Extension active');
    });
  }
}

async function updateRules() {
  try {
    chrome.storage.local.get('blockedSites', async (res) => {
      const blockedSites = res.blockedSites || [];

      const rules = blockedSites.map((site, idx) => ({
        id: idx + 1,
        priority: 1,
        action: {type: 'redirect', redirect: {extensionPath: '/blocked.html'}},
        condition: {
          urlFilter: site,
          resourceTypes: ['main_frame'],
        },
      }));

      await removeRules();

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
      });

      return {result: 'ok'};
    });
  } catch (error) {
    console.error('Error adding rules:', error);
    return {result: 'err', error};
  }
}

async function removeRules() {
  try {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule) => rule.id);
    return chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
    });
  } catch (error) {
    console.error('Error removing rules:', error);
  }
}
