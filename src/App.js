import React, {useEffect, useRef, useState, useCallback} from 'react';
import axios from 'axios';
import Call from './Call';
import {useLocalStorage} from './hooks/useLocalStorage';
import './App.css';
import produce from 'immer';
import {BooleanOption} from './BooleanOption';
import {NowPlaying} from './NowPlaying';
import {getFreqStats} from './Utils';
import {useHotkeys} from 'react-hotkeys-hook';
import Select from 'react-select';
import useDimensions from 'react-use-dimensions';
import {primary, primary2, primary4, secondary25} from './color';
import ReactList from 'react-list';
import {Settings} from './Settings';
import {useWindowSize} from './hooks/useWindowSize';
import dayjs from 'dayjs';

function App() {
  const windowSize = useWindowSize();
  const [optionsBlockRef, optionsBlockDimensions] = useDimensions();

  const styles = {
    optionsBlock: {
      position: 'fixed',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      top: 0,
      padding: 6,
      backgroundColor: '#FFF',
      width: '100%',
      borderBottom: '1px solid #eee',
      zIndex: 1000,
      boxShadow: '1px 1px 2px #adadad',
      boxSizing: 'border-box',
    },
    leftOptionsBlock: {
      marginRight: windowSize.width >= 600 ? 8 : 0,
      width: windowSize.width >= 600 ? '40%' : '100%',
    },
    rightOptionsBlock: {
      boxSizing: 'border-box',
      flexGrow: 1,
      backgroundColor: secondary25,
      padding: 10,
      borderRadius: 4,
      boxShadow: '1px 1px 2px #999',
      width: 1,
    },
    buttons: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    records: {
      paddingTop: optionsBlockDimensions.height
        ? optionsBlockDimensions.height + 2
        : 0,
    },
    audio: {
      width: '100%',
      userSelect: 'none',
      outline: 0,
      boxShadow: '1px 1px 2px #999',
      borderRadius: 30,
    },
    select: {
      outline: 0,
    },
    loadError: {
      backgroundColor: primary2,
      color: primary4,
      padding: 10,
      margin: 10,
      borderRadius: 4,
    },
    loading: {
      color: primary4,
      padding: 10,
      margin: 10,
      textAlign: 'center',
      fontWeight: 400,
    },
  };

  const [calls, setCalls] = useState([]);
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dirSize, setDirSize] = useState(null);
  const [freeSpace, setFreeSpace] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [freqStats, setFreqStats] = useState([]);
  const [loading, setLoading] = useState(true);
  // array of [newest_call_time, last_checked_time]
  const [lastUpdate, setLastUpdate] = useState([null, null]);
  const [callWaiting, setCallWaiting] = useState(false);

  const [mobileSettingsOpen, setMobileSettingsOpen] = useLocalStorage(
    'mobileSettingsOpen',
    false,
  );
  const [listenedArr, setListenedArr] = useLocalStorage('listenedArr', []);
  const [likedArr, setLikedArr] = useLocalStorage('likedArr', []);
  const [hiddenArr, setHiddenArr] = useLocalStorage('hiddenArr', []);
  const [autoplay, setAutoplay] = useLocalStorage('autoplay', true);
  const [autoloadDelay, setAutoloadDelay] = useLocalStorage('setAutoloadDelay', 0);
  const [freqData, setFreqData] = useLocalStorage('freqData', []);
  const [showRead, setShowRead] = useLocalStorage('showRead', true);
  const [showOnlyFreq, setShowOnlyFreq] = useLocalStorage('showOnlyFreq', '');
  const [serverIP, setServerIP] = useLocalStorage(
    'setServerIP',
    window.location.hostname,
  );
  const [showSince, setShowSince] = useLocalStorage(
    'setShowSince',
    60 * 60 * 24,
  );

  const audioRef = useRef(null);
  const filteredCallRefs = useRef([]);

  const [buttonsRef, buttonsDimensions] = useDimensions();

  const serverUrl = `http://${serverIP}:8080/`;

  const selectedCall = calls.find((call) => call.file === selected);
  const allFreqs = calls.map((call) => call.freq);

  const uniqueFreqs = [...new Set(allFreqs)];

  const unlistenedCalls = calls.filter(
    (call) => !listenedArr.includes(call.file),
  );

  let filteredFreqs = uniqueFreqs.filter((freq) => !hiddenArr.includes(freq));

  if (showHidden) {
    filteredFreqs = uniqueFreqs.filter((freq) => hiddenArr.includes(freq));
  }

  const getData = useCallback(async (fromTime) => {
    setLoading(true);
    const now = Math.floor(Date.now() / 1000);
    let newestCall = null;
    if (!fromTime) {
      fromTime = now - showSince;
      newestCall = now;
    }

    try {
      console.log(`requesting calls since ${dayjs(fromTime * 1000).format('YYYY-MM-DD HH:mm:ss')}`);
      const result = await axios.post(serverUrl + 'data', {
        fromTime: fromTime
      });
      const {files, dirSize, freeSpace} = result.data;

      setDirSize(dirSize);
      setFreeSpace(freeSpace);

      if (files.length > 0) {
        setCalls(c => c.concat(files));
        newestCall = files.reduce((acc, cur) => Math.max(acc, cur.time), 0);
      }
      // set lastUpdate to trigger autoload
      setLastUpdate(([lastCallTime, lastCheckTime]) =>
        [(newestCall ? newestCall : lastCallTime), now]
      );
    } catch (e) {
      setLoadError(true);
    }

    setLoading(false);
  }, [serverUrl, showSince]);

  // poll for new calls
  useEffect(() => {
    if (autoloadDelay <= 0) return;
    const [lastCallTime, lastCheckTime] = lastUpdate;
    if (!lastCallTime) return;
    const timer = setTimeout(() => {
      // request all calls since the last call
      getData(lastCallTime + 0.001);
    }, autoloadDelay * 1000);
    return () => clearTimeout(timer);
  }, [lastUpdate, getData, autoloadDelay]);

  useEffect(() => {
    setCalls([]);
    getData();
  }, [getData]);

  useEffect(() => {
    const orderedStats = getFreqStats(calls);

    setFreqStats(orderedStats);
  }, [calls, showSince]);

  const frequencyListItems = filteredFreqs.map((freq) => {
    const freqItem = freqData.find((freqItem) => freqItem.freq === freq);
    const unlistenedCount = unlistenedCalls.filter((call) => call.freq === freq)
      .length;

    return {
      freq,
      name: freqItem ? freqItem.name : '',
      unlistenedCount,
    };
  });

  useEffect(() => {
    if (!showOnlyFreq && frequencyListItems.length) {
      setShowOnlyFreq(frequencyListItems[0].freq);
    }
  }, [frequencyListItems, setShowOnlyFreq, showOnlyFreq]);

  let filteredCalls = calls.filter((call) => !hiddenArr.includes(call.freq));

  if (showHidden) {
    filteredCalls = calls.filter((call) => hiddenArr.includes(call.freq));
  }

  if (showOnlyFreq) {
    filteredCalls = filteredCalls.filter((call) => call.freq === showOnlyFreq);
  }

  if (!showRead) {
    filteredCalls = filteredCalls.filter(
      (call) => !listenedArr.includes(call.file),
    );
  }

  filteredCallRefs.current = new Array(filteredCalls.length);

  const selectedCallIndex = filteredCalls.findIndex(
    (call) => call.file === selected,
  );

  const scrollIntoView = (offset = 1, options = {block: 'nearest'}) => {
    try {
      filteredCallRefs.current[selectedCallIndex + offset].scrollIntoView(options);
    } catch (ignore) {
    }
  };

  const playNext = (skipAmount = 1) => {
    const nextCall = filteredCalls[selectedCallIndex + skipAmount];

    setListenedArr([...listenedArr, selected]);
    if (nextCall) {
      setSelected(nextCall.file);
    } else {
      // nothing to play yet, but try again when new calls come in
      setCallWaiting(true);
    }
  };

  // automatically play new calls as they come in
  useEffect(() => {
    if (!filteredCalls.length || (selectedCallIndex === filteredCalls.length-1) || !callWaiting || !autoplay) return;
    setCallWaiting(false);
    // scroll the newly added call into view
    scrollIntoView();
    playNext();
  }, [calls, callWaiting, selected]);

  function pause(event) {
    event.preventDefault();

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }

  useHotkeys('k,down', () => playNext(), {}, [
    selected,
    listenedArr,
    filteredCalls,
    filteredCallRefs,
  ]);
  useHotkeys('j,up', () => playNext(-1), {}, [
    selected,
    listenedArr,
    filteredCalls,
  ]);
  useHotkeys('space', (event) => pause(event), {}, [audioRef, playing]);
  useHotkeys('shift+k,shift+down', () =>
    window.scrollTo(0, document.body.scrollHeight),
  );

  useHotkeys('shift+j,shift+up', () => window.scrollTo(0, 0));
  useHotkeys('s', () => (audioRef.current.currentTime += 5));
  useHotkeys('a', () => (audioRef.current.currentTime -= 5));

  const selectOptions = frequencyListItems.map((freqItem) => ({
    value: freqItem.freq,
    label: (
      <div
        style={{
          fontWeight: freqItem.unlistenedCount ? '500' : 'auto',
        }}>
        {`${freqItem.freq} ${freqItem.name ? freqItem.name : ''} (${
          freqItem.unlistenedCount
        })`}
      </div>
    ),
  }));

  const customStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: 'none',
      borderColor: '#EEE !important',
      height: 44,
      marginBottom: windowSize.width >= 600 ? 0 : 4,
    }),
  };

  const handleDeleteBefore = async (beforeTime) => {
    await axios.post(`${serverUrl}deleteBefore`, {
      deleteBeforeTime: Math.floor(Date.now() / 1000) - beforeTime,
    });

    window.location.reload();
  };

  return (
    <div>
      <Settings
        visible={showSettings}
        dirSize={dirSize}
        freeSpace={freeSpace}
        handleClose={() => setShowSettings(false)}
        freqStats={freqStats}
        showSince={showSince}
        setShowSince={setShowSince}
        setShowOnlyFreq={setShowOnlyFreq}
        handleDeleteBefore={handleDeleteBefore}
        freqData={freqData}
        autoloadDelay={autoloadDelay}
        setAutoloadDelay={setAutoloadDelay}
      />
      <div ref={optionsBlockRef} style={styles.optionsBlock}>
        {windowSize.width >= 600 || mobileSettingsOpen ? (
          <div style={styles.leftOptionsBlock}>
            <div ref={buttonsRef} style={styles.buttons}>
              <BooleanOption
                title={'Autoplay'}
                containerWidth={buttonsDimensions.width}
                value={autoplay}
                onClick={() => {
                  setAutoplay(!autoplay);
                }}
              />
              <BooleanOption
                title={'Settings'}
                containerWidth={buttonsDimensions.width}
                onClick={() => {
                  setShowSettings(true);
                }}
              />
              <BooleanOption
                title={'Hide Listened'}
                containerWidth={buttonsDimensions.width}
                value={!showRead}
                onClick={() => {
                  setShowRead(!showRead);
                }}
              />
              <BooleanOption
                title={'Show Hidden'}
                containerWidth={buttonsDimensions.width}
                value={showHidden}
                onClick={() => {
                  setShowHidden(!showHidden);
                }}
              />
              <BooleanOption
                title={'Scroll to Top'}
                containerWidth={buttonsDimensions.width}
                onClick={() => {
                  window.scrollTo(0, 0);
                }}
              />
              <BooleanOption
                title={'Scroll to Bottom'}
                containerWidth={buttonsDimensions.width}
                onClick={() => {
                  window.scrollTo(0, document.body.scrollHeight);
                }}
              />
              <BooleanOption
                title={'Delete Listened'}
                containerWidth={buttonsDimensions.width}
                warning={true}
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Are you sure you want to delete all listened audio${
                        showOnlyFreq ? ' on this freq?' : '?'
                      }`,
                    )
                  ) {
                    return false;
                  }

                  let filesToDelete;

                  if (showOnlyFreq) {
                    filesToDelete = calls
                      .filter(
                        (call) =>
                          call.freq === showOnlyFreq &&
                          listenedArr.includes(call.file),
                      )
                      .map((call) => call.file);
                  } else {
                    filesToDelete = calls
                      .filter((call) => listenedArr.includes(call.file))
                      .map((call) => call.file);
                  }

                  await axios.post(`${serverUrl}delete`, {
                    files: filesToDelete,
                  });

                  setShowOnlyFreq('');
                  getData();
                }}
              />
              <BooleanOption
                title={'Mark Listened'}
                containerWidth={buttonsDimensions.width}
                warning={true}
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Are you sure you want to mark ${
                        showOnlyFreq ? 'this frequency' : 'all calls'
                      } as read?`,
                    )
                  ) {
                    return false;
                  }

                  let itemsToMark;

                  if (showOnlyFreq) {
                    itemsToMark = unlistenedCalls.filter(
                      (call) => call.freq === showOnlyFreq,
                    );
                  } else {
                    itemsToMark = calls;
                  }
                  const tmpListenedArr = await produce(
                    listenedArr,
                    async (draft) => {
                      itemsToMark.forEach((call) => {
                        draft.push(call.file);
                      });
                    },
                  );

                  setListenedArr(tmpListenedArr);
                }}
              />
            </div>
            <div>
              <Select
                style={styles.select}
                value={selectOptions.find(
                  (option) => option.value === showOnlyFreq,
                )}
                placeholder={'Select a frequency'}
                options={selectOptions}
                styles={customStyles}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 4,
                  colors: {
                    ...theme.colors,
                    primary25: primary2,
                    primary: primary,
                  },
                })}
                onChange={(res) => {
                  setShowOnlyFreq(res.label === 'No filter' ? '' : res.value);

                  setTimeout(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                  }, 200);
                }}
              />
            </div>
          </div>
        ) : null}
        {windowSize.width < 600 ? (
          <div style={{width: '100%'}}>
            <BooleanOption
              fullWidth={true}
              title={!mobileSettingsOpen ? 'Open Panel' : 'Close Panel'}
              onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
            />
          </div>
        ) : null}
        <div style={styles.rightOptionsBlock}>
          <NowPlaying call={selectedCall} freqData={freqData} scrollIntoView={scrollIntoView} />
          <audio
            ref={audioRef}
            style={styles.audio}
            onPlay={() => {
              setPlaying(true);
            }}
            onPause={() => {
              setPlaying(false);
            }}
            onEnded={() => {
              setPlaying(false);

              if (!autoplay) {
                return;
              }

              playNext();
            }}
            // set autoPlay for taps and keyboard input
            autoPlay={true}
            preload={'none'}
            src={selected ? `${serverUrl}static/${selected}` : null}
            controls
          />
        </div>
      </div>

      <div style={styles.records}>
        {loadError ? (
          <div style={styles.loadError}>
            There was an issue connecting to the server. Please ensure the
            settings are correct.
          </div>
        ) : null}

        {!loading && !filteredCalls.length && !loadError ? (
          <div style={styles.loadError}>
            No calls to display. Try changing frequency.
          </div>
        ) : null}
        {loading && filteredCalls.length === 0 ? (
          <div style={styles.loading}>Loading calls...</div>
        ) : (
          <ReactList
            itemRenderer={(index, key) => {
              const call = filteredCalls[index];

              return (
                <div
                  key={index}
                  ref={(el) => (filteredCallRefs.current[index] = el)}>
                  <Call
                    data={call}
                    autoplay={autoplay}
                    selected={selected === call.file}
                    listened={listenedArr.includes(call.file)}
                    hidden={hiddenArr.includes(call.freq)}
                    liked={likedArr.includes(call.freq)}
                    freqData={freqData}
                    setFreqData={setFreqData}
                    onClick={() => {
                      setListenedArr([...listenedArr, selected]);
                      setSelected(call.file);
                    }}
                    onLike={() => {
                      setLikedArr([...likedArr, call.freq]);
                    }}
                    onHide={() => {
                      setHiddenArr([...hiddenArr, call.freq]);
                    }}
                    onUnhide={() => {
                      setHiddenArr(
                        hiddenArr.filter((freq) => freq !== call.freq),
                      );
                    }}
                    onUnlike={() => {
                      setLikedArr(
                        likedArr.filter((freq) => freq !== call.freq),
                      );
                    }}
                    handleMarkRead={async (freq) => {
                      if (
                        !window.confirm(
                          'Are you sure you want to mark all as read?',
                        )
                      ) {
                        return false;
                      }

                      const itemsToMark = unlistenedCalls.filter(
                        (call) => call.freq === freq,
                      );
                      const tmpListenedArr = await produce(
                        listenedArr,
                        async (draft) => {
                          itemsToMark.forEach((call) => {
                            draft.push(call.file);
                          });
                        },
                      );

                      setListenedArr(tmpListenedArr);
                    }}
                  />
                </div>
              );
            }}
            minSize={50}
            length={filteredCalls.length}
            type="uniform"
          />
        )}
      </div>
    </div>
  );
}

export default App;
