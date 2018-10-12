'use strict';
chrome.runtime.onInstalled.addListener(function() {
  const url = chrome.runtime.getURL('data.json');
  const profile = { verticalAvg: 0, horizontalAvg: 0, size: 0 };
  const allDataPoints = [];

  fetch(url)
      .then((response) => response.json())
      .then((json) => {
        json.forEach(newsSource => {
          if (!newsSource.url) return;

          const url = new URL(newsSource.url);
          const hostName = url.host.replace(/www\./g, '');

          chrome.history.search({ text: hostName }, function(results){
            results = results.filter(result => result.url.indexOf(hostName) > -1);
            const size = results.length;
            if (size === 0) return;

            const { horizontal, vertical } = newsSource
            allDataPoints.push({ horizontal, vertical });
            profile.verticalAvg = ((profile.verticalAvg * profile.size) + vertical) / (profile.size + 1);
            profile.horizontalAvg = ((profile.horizontalAvg * profile.size) + horizontal) / (profile.size + 1);
            profile.size++;

            if (newsSource.name === json[json.length-1].name) console.log(profile);
          });
        })
      });


  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher()],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.webNavigation.onCompleted.addListener(function({ frameId, url }) {
  if (frameId !== 0) return;
  console.log(url);
});
