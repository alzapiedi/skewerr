function getDataJson() {
  const url = chrome.runtime.getURL('data.json');
  return fetch(url).then(response => response.json());
}

function parseHistory(json) {
  const allDataPoints = [];
  const profile = { horizontalAvg: 0, verticalAvg: 0, size: 0 };
  return new Promise((resolve, reject) => {
    try {
      json.forEach(newsSource => {
        const host = new URL(newsSource.url).host.replace(/www\./g, '');
        chrome.history.search({ text: host, startTime: 0 }, results => {
          results.filter(result => result.url.indexOf(host) > -1).forEach(result => {
            profile.verticalAvg = (profile.verticalAvg * profile.size + newsSource.vertical) / (profile.size + 1);
            profile.horizontalAvg = (profile.horizontalAvg * profile.size + newsSource.horizontal) / (profile.size + 1);
            profile.size++;
            allDataPoints.push({ vertical: newsSource.vertical, horizontal: newsSource.horizontal, newsSource });
          });
          if (newsSource.name === json[json.length-1].name) resolve({ allDataPoints, profile });
        });
      })
    } catch (err) {
      reject(err);
    }
  });
}

function updateProfile(url) {
  const host = new URL(url).host;
  chrome.storage.sync.get(['allDataPoints', 'profile'], results => {
    const { allDataPoints, profile } = results;
    findNewsSource(host).then(newsSource => {
      profile.verticalAvg = (profile.verticalAvg * profile.size + newsSource.vertical) / (profile.size + 1);
      profile.horizontalAvg = (profile.horizontalAvg * profile.size + newsSource.horizontal) / (profile.size + 1);
      profile.size++;
      allDataPoints.push({ vertical: newsSource.vertical, horizontal: newsSource.horizontal, newsSource });

      saveData({ allDataPoints, profile });
    });
  });
}

function findNewsSource(host) {
  return new Promise((resolve, reject) => {
    getDataJson().then(json => {
      const source = json.find(entry => entry.url.indexOf(host) > -1);
      if (!source) {
        console.log('error',host);
        reject(new Error('ERROR: a news source was detected but the data on the source could not be found'));
      }
      resolve(source);
    })
  });
}

function saveData({ allDataPoints, profile }) {
  console.log('Saving data');
  chrome.storage.sync.set({ allDataPoints, profile }, () => console.log(allDataPoints, profile));
}
