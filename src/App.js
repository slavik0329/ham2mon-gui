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

function App() {
  const windowSize = useWindowSize();

  const styles = {
    optionsBlock: {
      position: 'fixed',
      display: "flex",
      flexWrap: "wrap",
      top: 0,
      padding: 10,
      backgroundColor: "#FFF",
      width: "100%",
      borderBottom: "1px solid #eee",
    },
    leftOptionsBlock: {
      marginRight: 20
    },
    rightOptionsBlock: {
      marginRight: 24,
      flexGrow: 1
    },
    records: {
      paddingTop: windowSize.width >= 600 ? 140 : 242
    },
    audio: {
      width: "100%",
      userSelect: "none",
      outline: 0
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
    const result = await axios.get('http://localhost:3124/');
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
      filteredCallRefs.current[selectedCallIndex + skipAmount].scrollIntoView({block: 'end'});
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

  useHotkeys('k', () => playNext(), {}, [selected, listenedArr, filteredCalls, filteredCallRefs]);
  useHotkeys('j', () => playNext(-1), {}, [selected, listenedArr, filteredCalls]);
  useHotkeys('space', (event) => pause(event), {}, [audioRef, playing]);
  useHotkeys('shift+k', () => window.scrollTo(0, document.body.scrollHeight));
  useHotkeys('shift+j', () => window.scrollTo(0, 0));

  return (
    <div>
      <div style={styles.optionsBlock}>
        <div style={styles.leftOptionsBlock}>
          <div>
            <BooleanOption
              title={'Show Hidden'}
              value={showHidden}
              onClick={() => {
                setShowHidden(!showHidden);
              }}
            />
            <BooleanOption
              title={'Scroll to Bottom'}
              value={showHidden}
              onClick={() => {
                window.scrollTo(0, document.body.scrollHeight);
              }}
            />
            {showOnlyFreq ? <BooleanOption
              title={'Delete Listened'}
              warning={true}
              value={showHidden}
              onClick={async () => {
                if (!window.confirm("Are you sure you want to delete all listened audio on this freq?")) {
                  return false;
                }

                const filesToDelete = calls.filter(call =>
                  call.freq === showOnlyFreq &&
                  listenedArr.includes(call.file)
                ).map(call=>call.file);

                await axios.post(`${serverUrl}delete`, {
                  files: filesToDelete
                });

                setShowOnlyFreq('');
                getData();
              }}
            /> : null}
          </div>
          <div>
            <BooleanOption
              title={'Hide Listened'}
              value={!showRead}
              onClick={() => {
                setShowRead(!showRead);
              }}
            />
            <BooleanOption
              title={'Scroll to Top'}
              value={showHidden}
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            />
          </div>
          <div>
            <BooleanOption
              title={'Autoplay'}
              value={autoplay}
              onClick={() => {
                setAutoplay(!autoplay);
              }}
            />
            <BooleanOption
              title={'Skip call'}
              value={showHidden}
              onClick={() => {
                playNext();
              }}
            />
          </div>
          <div>
            <select
              value={showOnlyFreq}
              onChange={(event) => {
                setShowOnlyFreq(event.target.value === 'No filter' ? '' : event.target.value);

                setTimeout(() => {
                  window.scrollTo(0, document.body.scrollHeight);
                }, 200)
              }}
            >
              <option key={0} value={null}>No filter</option>
              {frequencyListItems.map(freqItem => (
                <option
                  key={freqItem.freq}
                  value={freqItem.freq}
                >
                  {freqItem.freq} {freqItem.name ? `(${freqItem.name})` : null}
                  ({freqItem.unlistenedCount})
                </option>
              ))}
            </select>
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
            autoPlay={true}
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
