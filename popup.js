const currentArticleButton = document.getElementById('this-article');
const myProfileButton = document.getElementById('my-profile');
const myHistory = document.getElementById('my-history');
const buttons = [currentArticleButton, myProfileButton, myHistory];
const url = chrome.runtime.getURL('data.json');

const VIEW_CURRENT_ARTICLE = 'current';
const VIEW_PROFILE = 'profile';
const VIEW_HISTORY = 'history';

let _json;

fetch(url)
  .then(response => response.json())
  .then(init);

function init(json) {
  _json = json;
  registerEventListeners();
  getUrlMatch().then(url => {
    url ? setActiveView(VIEW_CURRENT_ARTICLE, url) : setActiveView(VIEW_PROFILE);
  });
}

function getUrlMatch() {
  const allUrls = _json.map(entry => entry.url);
  const allHosts = allUrls.map(url => new URL(url).host.replace(/www\./g, '').replace(/\./, '\\.'));
  const regex = new RegExp(allHosts.join('|'));

  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, tabs => {
      if (tabs && tabs[0]) {
        const match = tabs[0].url.match(regex);
        resolve(match ? match[0] : undefined);
      }
      reject(new Error('ERROR: No tab found. I don\'t even know how this is possible...'));
    });
  });
}

function registerEventListeners() {
  currentArticleButton.addEventListener('click', () => getUrlMatch().then(url => setActiveView(VIEW_CURRENT_ARTICLE, url)));
  myProfileButton.addEventListener('click', () => setActiveView(VIEW_PROFILE));
  myHistory.addEventListener('click', () => setActiveView(VIEW_HISTORY));
}

function setActiveView(view, currentArticleUrl) {
  clearGraph();
  buttons.forEach(button => button.className = '');
  switch (view) {
    case VIEW_CURRENT_ARTICLE:
      return setViewCurrentArticle(currentArticleUrl);
    case VIEW_PROFILE:
      return setViewProfile();
    case VIEW_HISTORY:
      return setViewHistory();
    default:
      throw new Error('ERROR: You did this. I don\'t know how, but I know you did');
  }
}

function setViewCurrentArticle(url) {
  currentArticleButton.disabled = false;
  currentArticleButton.className = 'active';
  const newsSource = _json.find(newsSource => newsSource.url.indexOf(url) > -1);
  drawCanvas();
  const point = mapHorizontalVerticalToPoint(newsSource);
  drawPoint(point);
}

function setViewProfile() {
  myProfileButton.className = 'active';
  drawCanvas();
  chrome.storage.sync.get('profile', results => {
    const { horizontalAvg: horizontal, verticalAvg: vertical } = results.profile;
    const point = mapHorizontalVerticalToPoint({ horizontal, vertical });
    drawPoint(point);
  })
}
