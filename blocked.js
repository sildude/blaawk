const urlParams = new URLSearchParams(window.location.search);
const blockedUrl = urlParams.get('blockedUrl');

if (blockedUrl) {
  const decodedUrl = decodeURIComponent(blockedUrl);

  chrome.storage.local.get('redirects', (result) => {
    const redirects = result.redirects;

    let site = redirects.find(
      (redirect) => redirect.originalUrl === decodedUrl
    );

    if (site) {
      site.blocked_nr += 1;
    } else {
      redirects.push({
        originalUrl: decodedUrl,
        blocked_nr: 1,
      });
    }

    chrome.storage.local.set({redirects});
  });
}
