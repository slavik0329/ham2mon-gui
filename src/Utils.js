import {useEffect, useRef, useState} from "react";

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
    hoursStr = pad(minutes, 2) + ':';
  }

  return  hoursStr + pad(minutes, 2) + ':' + pad(seconds, 2);
};

export function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

export const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

export const getLocalStorage = () => {
  const a = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const v = localStorage.getItem(k);
    a[k] = v;
  }
  return JSON.stringify(a);
};

export const writeLocalStorage = data => {
  const o = JSON.parse(data);
  for (const property in o) {
    if (o.hasOwnProperty(property)) {
      localStorage.setItem(property, o[property]);
    }
  }
};

export const download = (filename, text) => {
  const pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    const event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
};

export function useHover() {
  const [value, setValue] = useState(false);

  const ref = useRef(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);

        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );

  return [ref, value];
}

export function getFreqStats(statFiles) {
  let statObj = {};

  for (let statFile of statFiles) {
    const {freq} = statFile;

    if (!statObj[freq]) {
      statObj[freq] = {count: 1};
    } else {
      statObj[freq].count++;
    }
  }

  const statEntries = Object.entries(statObj);
  const orderedStats = statEntries.sort((a, b) => {
    if (a[1].count > b[1].count) {
      return -1;
    } else {
      return 1;
    }
  }).map(entry => ({freq: entry[0], count: entry[1].count}))
  return orderedStats;
}
