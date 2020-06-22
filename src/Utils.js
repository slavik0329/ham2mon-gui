export const sec2time = (timeInSeconds, useHours) => {
  const pad = function (num, size) {
    return ('000' + num).slice(size * -1);
  };

  const time = parseFloat(timeInSeconds).toFixed(3);
  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time - minutes * 60);
  // milliseconds = time.slice(-3);
  let hoursStr = '';
  if (useHours) {
    hoursStr = pad(hours, 2) + ':';
  }

  return hoursStr + pad(minutes, 2) + ':' + pad(seconds, 2);
};

export const isChrome =
  /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

export const getLocalStorage = () => {
  const a = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const v = localStorage.getItem(k);
    a[k] = v;
  }
  return JSON.stringify(a);
};

export const writeLocalStorage = (data) => {
  const o = JSON.parse(data);
  for (const property in o) {
    if (o.hasOwnProperty(property)) {
      localStorage.setItem(property, o[property]);
    }
  }
};

export const download = (filename, text) => {
  const pom = document.createElement('a');
  pom.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  );
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    const event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
};

export function getFreqStats(statFiles) {
  const statObj = statFiles.reduce((totals, file) => {
    totals[file.freq] = (totals[file.freq] || 0) + 1;
    return totals;
  }, {});

  const sortedStats = Object.entries(statObj).sort((a, b) =>
    a[1] > b[1] ? -1 : 1,
  );

  return sortedStats.map((stat) => ({freq: stat[0], count: stat[1]}));
}
