const thisArticleButton = document.getElementById('this-article');
const myProfileButton = document.getElementById('my-profile');
const myHistory = document.getElementById('my-history');
const url = chrome.runtime.getURL('data.json');
fetch(url)
  .then(response => response.json())
  .then(init)

function init(json) {
  drawCanvas();
}
