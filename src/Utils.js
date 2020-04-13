import {useEffect, useState} from "react";

export const sec2time = timeInSeconds => {
  const pad = function (num, size) {
    return ('000' + num).slice(size * -1);
  };

  const time = parseFloat(timeInSeconds).toFixed(3);
  // hours = Math.floor(time / 60 / 60),
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time - minutes * 60);
  // milliseconds = time.slice(-3);

  return pad(minutes, 2) + ':' + pad(seconds, 2);
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
  var a = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    var v = localStorage.getItem(k);
    a[k] = v;
  }
  var s = JSON.stringify(a);
  return s;
};

export const writeLocalStorage = data => {
  var o = JSON.parse(data);
  for (var property in o) {
    if (o.hasOwnProperty(property)) {
      localStorage.setItem(property, o[property]);
    }
  }
};
