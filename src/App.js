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

  const [mobileSettingsOpen, setMobileSettingsOpen] = useLocalStorage(
    'mobileSettingsOpen',
    false,
  );
  const [listenedArr, setListenedArr] = useLocalStorage('listenedArr', []);
  const [likedArr, setLikedArr] = useLocalStorage('likedArr', []);
  const [hiddenArr, setHiddenArr] = useLocalStorage('hiddenArr', []);
  const [autoplay, setAutoplay] = useLocalStorage('autoplay', true);
  const [freqData, setFreqData] = useLocalStorage('freqData', []);
  const [showRead, setShowRead] = useLocalStorage('showRead', true);
  const [selectedFreqs, setSelectedFreqs] = useLocalStorage('selectedFreqs', ["0"]);
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

  const getData = useCallback(async () => {
    setLoading(true);

    try {
      const result = await axios.post(serverUrl + 'data', {
        fromTime: Math.floor(Date.now() / 1000) - showSince,
      });

      const {files, dirSize, freeSpace} = result.data;

      setDirSize(dirSize);
      setFreeSpace(freeSpace);
      setCalls(files);
    } catch (e) {
      setLoadError(true);
    }

    setLoading(false);
  }, [serverUrl, showSince]);

  useEffect(() => {
    setCalls([]);
    getData();
  }, [getData, showSince]);

  useEffect(() => {
    const orderedStats = getFreqStats(calls);

    setFreqStats(orderedStats);
  }, [calls, showSince]);

  const frequencyListItems = [...filteredFreqs].sort().map((freq) => {
    const freqItem = freqData.find((freqItem) => freqItem.freq === freq);
    const unlistenedCount = unlistenedCalls.filter((call) => call.freq === freq)
      .length;

    return {
      freq,
      name: freqItem ? freqItem.name : '',
      unlistenedCount,
    };
  });

  let filteredCalls = calls.filter((call) => !hiddenArr.includes(call.freq));

  if (showHidden) {
    filteredCalls = calls.filter((call) => hiddenArr.includes(call.freq));
  }

  if (selectedFreqs) {
    filteredCalls = filteredCalls.filter((call) => selectedFreqs.includes(call.freq));
  }

  if (!showRead) {
    filteredCalls = filteredCalls.filter(
      (call) => !listenedArr.includes(call.file),
    );
  }

  useEffect(() => {
    filteredCallRefs.current = new Array(filteredCalls.length);
  }, [filteredCalls]);

  const playNext = (skipAmount = 1) => {
    const selectedCallIndex = filteredCalls.findIndex(
      (call) => call.file === selected,
    );

    const nextCall = filteredCalls[selectedCallIndex + skipAmount];

    // Doesn't scroll now because of new scoll component
    // try {
    //   filteredCallRefs.current[selectedCallIndex + skipAmount].scrollIntoView({block: 'center'});
    // } catch (e) {
    //
    // }

    setListenedArr([...listenedArr, selected]);
    if (nextCall) {
      setSelected(nextCall.file);
    }
  };

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

  const selectedFreqItems = selectedFreqs ? selectOptions.filter((opt) => selectedFreqs.includes(opt.value)) : [];

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
        setSelectedFreqs={setSelectedFreqs}
        handleDeleteBefore={handleDeleteBefore}
        freqData={freqData}
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
                        selectedFreqs ? ' on this freq?' : '?'
                      }`,
                    )
                  ) {
                    return false;
                  }

                  let filesToDelete;

                  if (selectedFreqs) {
                    filesToDelete = calls
                      .filter(
                        (call) =>
                          selectedFreqs.includes(call.freq) &&
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

                  setSelectedFreqs([]);
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
                        selectedFreqs ? 'this frequency' : 'all calls'
                      } as read?`,
                    )
                  ) {
                    return false;
                  }

                  let itemsToMark;

                  if (selectedFreqs) {
                    itemsToMark = unlistenedCalls.filter(
                      (call) => selectedFreqs.includes(call.freq),
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
                value={selectedFreqItems}
                placeholder={'Select a frequency'}
                isMulti={true}
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
                  if (res) {
                    setSelectedFreqs(res.map((r) => r.value));
                  } else {
                    setSelectedFreqs([]);
                  }

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
          <NowPlaying call={selectedCall} freqData={freqData} />
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
        {loading ? (
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
