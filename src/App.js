import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import Call from "./Call";
import {useLocalStorage} from "./useLocalStorage";
import './App.css';
import produce from "immer";
import {BooleanOption} from "./BooleanOption";
import {NowPlaying} from "./NowPlaying";
import {useWindowSize} from "./Utils";
import {useHotkeys} from 'react-hotkeys-hook';
import Select from 'react-select'
import useDimensions from 'react-use-dimensions';
import {primary, primary25} from "./color";

// const serverUrl = 'http://localhost:3124/';

const serverUrl = 'http://192.168.1.167:3124/';

function App() {
  const windowSize = useWindowSize();

  const styles = {
    optionsBlock: {
      position: 'fixed',
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      top: 0,
      padding: 10,
      backgroundColor: "#FFF",
      width: "100%",
      borderBottom: "1px solid #eee",
    },
    leftOptionsBlock: {
      marginRight: 20,
      width: windowSize.width >= 600 ? "40%" : '100%',
    },
    buttons: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    rightOptionsBlock: {
      marginRight: 24,
      flexGrow: 1
    },
    records: {
      paddingTop: windowSize.width >= 600 ? 208 : 392
    },
    audio: {
      width: "100%",
      userSelect: "none",
      outline: 0
    },
    select: {
      outline: 0,
    }
  };

  const [calls, setCalls] = useState([]);
  const [selected, setSelected] = useState(null);

  const [playing, setPlaying] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [listenedArr, setListenedArr] = useLocalStorage('listenedArr', []);
  const [likedArr, setLikedArr] = useLocalStorage('likedArr', []);
  const [hiddenArr, setHiddenArr] = useLocalStorage('hiddenArr', []);
  const [autoplay, setAutoplay] = useLocalStorage('autoplay', false);
  const [freqData, setFreqData] = useLocalStorage('freqData', []);
  const [showRead, setShowRead] = useLocalStorage('showRead', true);

  const [showOnlyFreq, setShowOnlyFreq] = useLocalStorage('showOnlyFreq', '');
  const audioRef = useRef(null);

  const filteredCallRefs = useRef([]);

  const [buttonsRef, buttonsDimensions] = useDimensions();
  const selectedCall = calls.find(call => call.file === selected);
  const allFreqs = calls.map(call => call.freq);

  const uniqueFreqs = [...new Set(allFreqs)];

  const unlistenedCalls = calls.filter(call => !listenedArr.includes(call.file));
  let filteredFreqs = uniqueFreqs.filter(freq => !hiddenArr.includes(freq));
  if (showHidden) {
    filteredFreqs = uniqueFreqs.filter(freq => hiddenArr.includes(freq));
  }

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    const result = await axios.get(serverUrl);
    setCalls(result.data);
  };

  const frequencyListItems = filteredFreqs.map(freq => {
    const freqItem = freqData.find(freqItem => freqItem.freq === freq);
    const unlistenedCount = unlistenedCalls.filter(call => call.freq === freq).length;

    return {
      freq,
      name: freqItem ? freqItem.name : '',
      unlistenedCount
    };
  });

  useEffect(() => {
    if (!showOnlyFreq && frequencyListItems.length) {
      setShowOnlyFreq(frequencyListItems[0].freq);
    }
  }, [frequencyListItems, showOnlyFreq]);
  let filteredCalls = calls.filter(call => !hiddenArr.includes(call.freq));
  if (showHidden) {
    filteredCalls = calls.filter(call => hiddenArr.includes(call.freq));

  }
  if (showOnlyFreq) {
    filteredCalls = filteredCalls.filter(call => call.freq === showOnlyFreq);

  }
  if (!showRead) {
    filteredCalls = filteredCalls.filter(call => !listenedArr.includes(call.file));

  }

  useEffect(() => {
    filteredCallRefs.current = new Array(filteredCalls.length);
  }, []);

  const playNext = (skipAmount = 1) => {
    const selectedCallIndex = filteredCalls.findIndex(call => call.file === selected);

    const nextCall = filteredCalls[selectedCallIndex + skipAmount];

    try {
      filteredCallRefs.current[selectedCallIndex + skipAmount].scrollIntoView({block: 'center'});
    } catch (e) {

    }
    if (nextCall) {
      setSelected(nextCall.file);
      setListenedArr([
        ...listenedArr,
        nextCall.file
      ]);
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

  useHotkeys('k,down', () => playNext(), {}, [selected, listenedArr, filteredCalls, filteredCallRefs]);
  useHotkeys('j,up', () => playNext(-1), {}, [selected, listenedArr, filteredCalls]);
  useHotkeys('space', (event) => pause(event), {}, [audioRef, playing]);
  useHotkeys('shift+k,shift+down', () => window.scrollTo(0, document.body.scrollHeight));

  useHotkeys('shift+j,shift+up', () => window.scrollTo(0, 0));

  const selectOptions = frequencyListItems.map(freqItem => ({
    value: freqItem.freq,
    label: `${freqItem.freq} ${freqItem.name ? freqItem.name : ''} (${freqItem.unlistenedCount})`
  }));

  const customStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: "none",
      borderColor: "#EEE !important"
    })
  };

  return (
    <div>
      <div style={styles.optionsBlock}>
        <div style={styles.leftOptionsBlock}>
          <div
            ref={buttonsRef}
            style={styles.buttons}
          >
            <BooleanOption
              title={'Show Hidden'}
              containerWidth={buttonsDimensions.width}
              value={showHidden}
              onClick={() => {
                setShowHidden(!showHidden);
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
              title={'Scroll to Bottom'}
              containerWidth={buttonsDimensions.width}
              onClick={() => {
                window.scrollTo(0, document.body.scrollHeight);
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
              title={'Autoplay'}
              containerWidth={buttonsDimensions.width}
              value={autoplay}
              onClick={() => {
                setAutoplay(!autoplay);
              }}
            />
            <BooleanOption
              title={'Skip call'}
              containerWidth={buttonsDimensions.width}
              onClick={() => {
                playNext();
              }}
            />
            <BooleanOption
              title={'Delete Listened'}
              containerWidth={buttonsDimensions.width}
              warning={true}
              onClick={async () => {
                if (!window.confirm(`Are you sure you want to delete all listened audio${showOnlyFreq ? ' on this freq?' : "?"}`)) {
                  return false;
                }

                let filesToDelete;

                if (showOnlyFreq) {
                  filesToDelete = calls.filter(call =>
                    call.freq === showOnlyFreq &&
                    listenedArr.includes(call.file)
                  ).map(call => call.file);
                } else {
                  filesToDelete = calls.filter(call =>
                    listenedArr.includes(call.file)
                  ).map(call => call.file);
                }

                await axios.post(`${serverUrl}delete`, {
                  files: filesToDelete
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
                if (!window.confirm(`Are you sure you want to mark ${showOnlyFreq ? "this frequency" : "all calls"} as read?`)) {
                  return false;
                }

                let itemsToMark;

                if (showOnlyFreq) {
                  itemsToMark = unlistenedCalls.filter(call => call.freq === showOnlyFreq);
                } else {
                  itemsToMark = calls;
                }
                const tmpListenedArr = await produce(listenedArr, async (draft) => {
                  itemsToMark.forEach((call) => {
                    draft.push(call.file);
                  })
                });

                setListenedArr(tmpListenedArr);
              }}
            />
          </div>
          <div>
            <Select
              style={styles.select}
              value={selectOptions.find(option => option.value === showOnlyFreq)}
              placeholder={"Select a frequency"}
              options={selectOptions}
              styles={customStyles}
              theme={theme => ({
                ...theme,
                borderRadius: 4,
                colors: {
                  ...theme.colors,
                  primary25: primary25,
                  primary: primary,
                },
              })}
              onChange={(res) => {
                setShowOnlyFreq(res.label === 'No filter' ? '' : res.value);

                setTimeout(() => {
                  window.scrollTo(0, document.body.scrollHeight);
                }, 200)
              }}
            />
          </div>
        </div>
        <div style={styles.rightOptionsBlock}>
          <NowPlaying call={selectedCall} freqData={freqData}/>
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

              if (!autoplay) return;

              playNext();
            }}
            autoPlay={autoplay}
            preload={'none'}
            src={selected ? `${serverUrl}static/${selected}` : null}
            controls
          />
        </div>
      </div>

      <div style={styles.records}>
        {filteredCalls.map((call, i) => (
          <div
            key={i}
            ref={el => filteredCallRefs.current[i] = el}
          >
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
                setSelected(call.file);

                setListenedArr([
                  ...listenedArr,
                  call.file
                ]);
              }}
              onLike={() => {
                setLikedArr([
                  ...likedArr,
                  call.freq
                ]);
              }}
              onHide={() => {
                setHiddenArr([
                  ...hiddenArr,
                  call.freq
                ]);
              }}
              onUnhide={() => {
                setHiddenArr(hiddenArr.filter(freq => freq !== call.freq));
              }}
              onUnlike={() => {
                setLikedArr(likedArr.filter(freq => freq !== call.freq));
              }}
              handleMarkRead={async (freq) => {
                if (!window.confirm("Are you sure you want to mark all as read?")) {
                  return false;
                }

                const itemsToMark = unlistenedCalls.filter(call => call.freq === freq);
                const tmpListenedArr = await produce(listenedArr, async (draft) => {
                  itemsToMark.forEach((call) => {
                    draft.push(call.file);
                  })
                });

                setListenedArr(tmpListenedArr);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
