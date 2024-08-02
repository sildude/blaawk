chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateRules') {
    updateRules();
  }
});

function updateRules() {
  chrome.storage.local.get('blockedSites', (result) => {
    const blockedSites = result.blockedSites || [];

    const rules = blockedSites.map((site, idx) => ({
      id: idx + 1,
      priority: 1,
      action: {type: 'block'},
      condition: {
        urlFilter: site,
        resourceTypes: ['main_frame'],
      },
    }));

    chrome.declarativeNetRequest
      .updateDynamicRules({
        removeRuleIds: blockedSites.map((_, index) => index + 1),
      })
      .then(() => {
        chrome.declarativeNetRequest
          .updateDynamicRules({
            addRules: rules,
          })
          .then(() => {
            console.info('Rules updated:', rules);
          })
          .catch((error) => {
            console.error('Error adding rules:', error);
          });
      })
      .catch((error) => {
        console.error('Error removing rules:', error);
      });
  });
}
