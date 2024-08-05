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

function setAffirmation() {
  document.getElementById('affirmations').innerText =
    seagullAffirmations[Math.floor(Math.random() * seagullAffirmations.length)];
}

setAffirmation();

document
  .getElementById('affirmBlock')
  .addEventListener('click', setAffirmation);

const promptQuestions = [
  'Are you sure you want to remove all rules?',
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

chrome.storage.local.get('blockedSites', ({blockedSites}) => {
  if (blockedSites) {
    document.getElementById('siteList').value = blockedSites.join('\n');
  }
});

chrome.storage.local.get('paused', ({paused}) => {
  paused
    ? (document.getElementById('toggleButton').checked = false)
    : (document.getElementById('toggleButton').checked = true);
});

document.getElementById('save').addEventListener('click', () => {
  const siteList = document
    .getElementById('siteList')
    .value.split('\n')
    .filter((site) => site.trim() !== '');

  chrome.storage.local.set({blockedSites: siteList}, () => {
    chrome.runtime.sendMessage({
      action: 'updateState',
      paused: !document.getElementById('toggleButton').checked,
    });
  });
});

document.getElementById('toggleButton').addEventListener('change', (e) => {
  if (!e.target.checked) {
    askAllPrompts(promptQuestions).then((result) => {
      if (result.result === 'ok') {
        chrome.runtime.sendMessage({
          action: 'updateState',
          paused: true,
        });
      } else {
        document.getElementById('toggleButton').checked = true;
      }
    });
  } else {
    chrome.runtime.sendMessage({
      action: 'updateState',
      paused: false,
    });
  }
});

async function askAllPrompts(prompts) {
  for (const prompt of prompts) {
    const userResponse = confirm(prompt);
    if (!userResponse) {
      return {result: 'cancel'};
    }
  }
  return {result: 'ok'};
}
