'use strict';

getDataJson().then(json => {
  const allUrls = json.map(entry => entry.url);
  const allHosts = allUrls.map(url => new URL(url).host.replace(/www\./g, '').replace(/\./, '\\.'));
  const regex = new RegExp(allHosts.join('|'));
  chrome.webNavigation.onCompleted.addListener(function({ frameId, url }) {
    if (frameId !== 0) return;
    if (url.match(regex)) updateProfile(url);
  });
});

chrome.runtime.onInstalled.addListener(() => {
  getDataJson().then(parseHistory).then(saveData).catch(e => alert('A runtime error occurred while scanning your history'));
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher()],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
