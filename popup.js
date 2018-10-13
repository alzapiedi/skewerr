const currentArticleButton = document.getElementById('this-article');
const myProfileButton = document.getElementById('my-profile');
const myHistory = document.getElementById('my-history');
const heading = document.getElementById('heading');
const subheading = document.getElementById('subheading');
const legend = document.getElementById('legend');
const logo = document.getElementById('logo');
const popover = document.getElementById('popover');
const sourceScore = document.getElementById('source-score');
const buttons = [currentArticleButton, myProfileButton, myHistory, legend];
const url = chrome.runtime.getURL('data.json');

const VIEW_CURRENT_ARTICLE = 'current';
const VIEW_PROFILE = 'profile';
const VIEW_HISTORY = 'history';
const VIEW_LEGEND = 'legend';

let _json, _points;

const descriptors = {
  horizontal: {
    '-30': 'Skews Strongly Left',
    '-18': 'Skews Left',
    '-6': 'Skews Slightly Left',
    '6': 'Neutral',
    '18': 'Skews Slightly Right',
    '30': 'Skews Right',
    '42': 'Skews Strongly Right'
  },
  vertical: {
    '0': 'Inaccurate/Fabricated',
    '8': 'Propaganda/Misleading',
    '16': 'Selective or Incomplete',
    '24': 'Strongly Opinionated',
    '32': 'Mostly Analysis',
    '40': 'Mix of Facts/Analysis',
    '48': 'Fact Reporting',
    '56': 'Original Fact Reporting'
  }
}

fetch(url)
  .then(response => response.json())
  .then(init);

function init(json) {
  _json = json;
  registerEventListeners();
  getUrlMatch().then(({ url, iconUrl, newsSource }) => {
    url ? setActiveView(VIEW_CURRENT_ARTICLE, { url, iconUrl, newsSource }) : setActiveView(VIEW_PROFILE);
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
        const iconUrl = tabs[0].favIconUrl;
        resolve(match ? { url: match[0], iconUrl, newsSource: _json.find(entry => entry.url.indexOf(match[0]) > -1) } : {});
      }
      reject(new Error('ERROR: No tab found. I don\'t even know how this is possible...'));
    });
  });
}

function registerEventListeners() {
  setCanvasMouseListener();
  currentArticleButton.addEventListener('click', () => getUrlMatch().then(({ url, iconUrl, newsSource }) => setActiveView(VIEW_CURRENT_ARTICLE, { url, iconUrl, newsSource })));
  myProfileButton.addEventListener('click', () => setActiveView(VIEW_PROFILE));
  myHistory.addEventListener('click', () => setActiveView(VIEW_HISTORY));
  legend.addEventListener('click', () => setActiveView(VIEW_LEGEND));
}

function setActiveView(view, params = {}) {
  const { url, iconUrl, newsSource } = params;
  clearGraph();
  clearInterface();
  buttons.forEach(button => button.className = '');
  switch (view) {
    case VIEW_CURRENT_ARTICLE:
      return setViewCurrentArticle({ url, iconUrl, newsSource });
    case VIEW_PROFILE:
      return setViewProfile();
    case VIEW_HISTORY:
      return setViewHistory();
    case VIEW_LEGEND:
      return setViewLegend();
    default:
      alert('Y U DO DIS');
      throw new Error('ERROR: You did this. I don\'t know how, but I know you did');
  }
}

function setViewCurrentArticle({ url, iconUrl, newsSource }) {
  currentArticleButton.disabled = false;
  currentArticleButton.className = 'active';
  logo.src = iconUrl;
  heading.innerText = newsSource.name;
  subheading.innerText = getDescriptor(newsSource);
  const score = getScore(newsSource);
  renderScore(score);
  drawCanvas();
  const point = mapHorizontalVerticalToPoint(newsSource);
  _points = [{ ...point, newsSource }];
  drawPoint(point);
}

function setViewProfile() {
  myProfileButton.className = 'active';
  drawCanvas();
  chrome.storage.sync.get('profile', results => {
    const { horizontalAvg: horizontal, verticalAvg: vertical } = results.profile;
    const score = getScore({ horizontal, vertical });
    renderScore(score);
    const point = mapHorizontalVerticalToPoint({ horizontal, vertical });
    _points = [];
    heading.innerText = 'My Average';
    subheading.innerText = getDescriptor({ horizontal, vertical });
    drawPoint(point);
  })
}

function setViewHistory() {
  myHistory.className = 'active';
  drawCanvas();
  chrome.storage.sync.get(['allDataPoints', 'profile'], results => {
    const { horizontalAvg: horizontal, verticalAvg: vertical } = results.profile;
    const score = getScore({ horizontal, vertical });
    renderScore(score);
    heading.innerText = 'My History';
    subheading.innerText = getDescriptor({ horizontal, vertical });
    _points = [];
    results.allDataPoints.forEach(dataPoint => {
      const point = mapHorizontalVerticalToPoint(dataPoint);
      _points.push({ ...point, newsSource: dataPoint.newsSource});
      drawPoint(point);
    })
  })
}

function setViewLegend() {
  legend.className = 'active';
  drawCanvas();
  heading.innerText = 'Legend';
  subheading.innerText = 'Shows all tracked news sources';
  _points = [];
  _json.forEach(entry => {
    const point = mapHorizontalVerticalToPoint(entry);
    _points.push({ ...point, newsSource: entry });
    drawPoint(point);
  })
}

function renderScore(score) {
  sourceScore.innerText = score;
  sourceScore.style.display = 'flex';
  sourceScore.style.background = getScoreColor(score);
}

function clearInterface() {
  logo.src = '';
  subheading.innerText = '';
  heading.innerText = '';
  sourceScore.innerText = '';
  sourceScore.style.display = 'none';
}

function getDescriptor(newsSource) {
  let horizontal, vertical;
  if (newsSource.horizontal <= -30) horizontal = descriptors.horizontal['-30'];
  if (newsSource.horizontal >= -30) horizontal = descriptors.horizontal['-18'];
  if (newsSource.horizontal >= -18) horizontal = descriptors.horizontal['-6'];
  if (newsSource.horizontal >= -6) horizontal = descriptors.horizontal['6'];
  if (newsSource.horizontal >= 6) horizontal = descriptors.horizontal['18'];
  if (newsSource.horizontal >= 18) horizontal = descriptors.horizontal['30'];
  if (newsSource.horizontal >= 30) horizontal = descriptors.horizontal['42'];

  vertical = descriptors.vertical['0'];
  if (newsSource.vertical >= 8) vertical = descriptors.vertical['8'];
  if (newsSource.vertical >= 16) vertical = descriptors.vertical['16'];
  if (newsSource.vertical >= 40) vertical = descriptors.vertical['40'];
  if (newsSource.vertical >= 24) vertical = descriptors.vertical['24'];
  if (newsSource.vertical >= 32) vertical = descriptors.vertical['32'];
  if (newsSource.vertical >= 48) vertical = descriptors.vertical['48'];
  if (newsSource.vertical >= 56) vertical = descriptors.vertical['56'];

  return `${vertical}, ${horizontal}`;
}

function getScore({ horizontal, vertical }) {
  const score = parseInt(vertical + (35 - Math.abs(horizontal)));
  return score < 0 ? 0 : score;
}

function getScoreColor(score) {
  if (score <= 40) return '#ee9999';
  if (score <= 70) return '#fff45e';
  return '#61ff5e';
}

function setCanvasMouseListener() {
  canvas.addEventListener('mousemove', event => {
    const { x, y } = event.currentTarget.getClientRects()[0];
    const mouseX = event.clientX - x;
    const mouseY = event.clientY - y;
    const point = _points.find(point => (Math.abs(mouseX - point.x) < 5) && (Math.abs(mouseY - point.y) < 5));
    popover.style.top = mouseY > 280 ? '' : `${event.clientY}px`;
    popover.style.bottom = mouseY > 280 ? '20px' : '';
    popover.style.right = mouseX > 400 ? `${480 - event.clientX}px` : '';
    popover.style.left = mouseX > 400 ? '' : `${event.clientX}px`;
    popover.innerText = point ? point.newsSource.name : '';
    popover.className = point ? '' : 'hidden';
    canvas.style.cursor = point ? 'pointer' : 'default';
  });
}
