const promptQuestions = [
  'Are you sure you want to pause the extension?',
  'Are you REALLY sure???',
  'Think of all the missed productivity...',
  'But... but... what about your goals?',
  "Don't let those websites win!",
  "You're stronger than this, I believe in you!",
  "Seriously? You're gonna give up now?",
  'Have you considered the existential implications of this decision?',
  'Did you know that disabling this extension voids the warranty on your computer?',
  'Is this because of something I said?',
  "I'm not crying, you're crying.",
  'Hold on, let me just check with the productivity gods... They said this is a bad idea.',
  "Noooooo! Please don't go! I'm not gonna let you ruin your life!",
  "Fine, but don't come crawling back when those websites take over your life.",
];

const removalQuestions = [
  "Hold your feathers! You're trying to remove a website from the blocklist... Are you certain this site isn't distracting you from soaring high?",
  'Just double-checking: Is this website truly worth your precious time?',
  "Oh, I see what you're up to. Don't even think about it.",
  "Think twice, fly right. You don't want to crash, do you? Really remove this site?",
  'Are we really plucking sites from the blocklist now? Is this truly a wise decision?',
  "Wait a gull-darn minute! You're not letting distractions back in, are you?",
  'Last chance to fly right! Sure you want to let this site pull you from the skies?',
  'Are you absolutely, positively, undeniably sure you want to unblock this site?',
  'Alright, at your own risk! But I warned you.',
];

const seagullAffirmations = [
  "Flap those wings! You're meant to soar above distractions.",
  "Let's catch the thermal currents, not the time-wasters!",
  'Feather by feather, build your nest of success.',
  'Peck away at your goals, one small step at a time!',
  "Spread your wings wide - there's a whole sky of possibilities out there!",
  'Keep your beak pointed towards your dreams.',
  "Squawk less, soar more - let's stay on task today!",
  'Like a gull over the ocean, glide above the chaos with grace.',
  'A smooth sea never made a skilled gull. Tackle those challenges!',
  'Remember, every bird takes flight in its own time. Be patient with yourself.',
  'Let your spirit soar high, above the mundane!',
  `A true bird's eye view means focusing on what truly matters.`,
  'Ruffle those feathers and shake off the distractions!',
  'Catch the wind beneath your wings and rise above the noise.',
  'Stay light on those webbed feet, ready to pivot towards your goals.',
  'Just as we migrate with purpose, keep your journey focused and meaningful.',
  "Nestle into your tasks today like they're part of your cozy nest.",
  'Flutter towards productivity, and leave procrastination on the shoreline.',
  'Keep your eyes sharp like a hawk on the prize ahead.',
  "Whistle a happy tune as you glide through today's tasks effortlessly.",
];

const affirmationsElement = document.getElementById('affirmations');
const affirmBlockElement = document.getElementById('affirmBlock');
const siteListElement = document.getElementById('siteList');
const toggleButtonElement = document.getElementById('toggleButton');
const statsPageElement = document.getElementById('statsPage');
const pages = document.querySelectorAll('main');

let blocked = [];

// Function to set a random affirmation
function setAffirmation() {
  const randomIndex = Math.floor(Math.random() * seagullAffirmations.length);
  affirmationsElement.innerText = seagullAffirmations[randomIndex];
}

// Function to check if blocked sites were removed
function checkIfBlockedGotRemoved(siteList, oldSitelist) {
  return oldSitelist.filter((site) => !siteList.includes(site));
}

// Function to ask all prompts sequentially
async function askAllPrompts(prompts) {
  for (const prompt of prompts) {
    if (!confirm(prompt)) {
      return {result: 'cancel'};
    }
  }
  return {result: 'ok'};
}

// Function to toggle between pages
function togglePages() {
  const togglePageButton = document.getElementById('togglePageButton');

  pages.forEach((page) => page.classList.toggle('hidden'));
  togglePageButton.querySelector('p').innerText =
    togglePageButton.innerText === 'Stats' ? 'Options' : 'Stats';
  togglePageButton
    .querySelectorAll('svg')
    .forEach((svg) => svg.classList.toggle('hidden'));
}

// Function to remove redirects for removed sites
async function removeRedirects(removedSites) {
  try {
    const {redirects} = await chrome.storage.local.get('redirects');
    const updatedRedirects = redirects.filter(
      (redirect) => !removedSites.includes(redirect.originalUrl)
    );
    await chrome.storage.local.set({redirects: updatedRedirects});
  } catch (error) {
    console.error('Error removing redirects:', error);
  }
}

// Initial setup
setAffirmation();
affirmBlockElement.addEventListener('click', setAffirmation);

chrome.storage.local.get('blockedSites', ({blockedSites}) => {
  if (blockedSites) {
    blocked = blockedSites;
    siteListElement.value = blockedSites.join('\n');
  }
});

chrome.storage.local.get('paused', ({paused}) => {
  toggleButtonElement.checked = !paused;
});

chrome.storage.local.get('redirects', (blockedSiteLogs) => {
  if (blockedSiteLogs.redirects?.length > 0) {
    blockedSiteLogs.redirects.forEach((log) => {
      statsPageElement.innerHTML += `
        <div class="stats-item">
          <p>${log.originalUrl}</p>
          <p>${log.blocked_nr}</p>
        </div>
      `;
    });
  } else {
    statsPageElement.innerHTML = '<h3>No sites have been blocked yet.</h3>';
  }
});

// Event listeners
document.getElementById('save').addEventListener('click', () => {
  const siteList = siteListElement.value
    .split('\n')
    .filter((site) => site.trim() !== '');

  const removedSites = checkIfBlockedGotRemoved(siteList, blocked);

  if (removedSites.length > 0) {
    askAllPrompts(removalQuestions).then((result) => {
      if (result.result === 'ok') {
        removeRedirects(removedSites).then(() => {
          chrome.storage.local.set({blockedSites: siteList}, () => {
            chrome.runtime.sendMessage({
              action: 'updateState',
              paused: !toggleButtonElement.checked,
            });
          });
          blocked = siteList;
        });
      } else {
        siteListElement.value = blocked.join('\n');
      }
    });
  } else {
    chrome.storage.local.set({blockedSites: siteList}, () => {
      chrome.runtime.sendMessage({
        action: 'updateState',
        paused: !toggleButtonElement.checked,
      });
    });
    blocked = siteList;
  }
});

toggleButtonElement.addEventListener('change', (e) => {
  if (!e.target.checked) {
    askAllPrompts(promptQuestions).then((result) => {
      if (result.result === 'ok') {
        chrome.runtime.sendMessage({
          action: 'updateState',
          paused: true,
        });
      } else {
        toggleButtonElement.checked = true;
      }
    });
  } else {
    chrome.runtime.sendMessage({
      action: 'updateState',
      paused: false,
    });
  }
});

document
  .getElementById('togglePageButton')
  .addEventListener('click', togglePages);
