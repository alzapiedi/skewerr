'use strict';

chrome.runtime.onInstalled.addListener(function() {
  const url = chrome.runtime.getURL('data.json');

  fetch(url)
      .then((response) => response.json()) //assuming file contains json
      .then((json) => {
        json.forEach(newsSource => {
          chrome.history.search({ text: newsSource.name }, function(results){
            console.log(results);
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
