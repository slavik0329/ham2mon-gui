import React, {useState} from 'react';
import dayjs from "dayjs";

import produce from "immer"
import {sec2time} from "./Utils";

function Call({
                data,
                selected,
                listened,
                onClick,
                onLike,
                liked,
                onUnlike,
                hidden,
                onHide,
                onUnhide,
                freqData,
                setFreqData,
                handleMarkRead,
              }) {

  const styles = {
    item: {
      border: "1px solid #eee",
      padding: 6,
      margin: 10,
      display: 'flex',
      borderRadius: 4
    },
    audioBlock: {marginTop: 10},
    audio: {
      width: 400,
      marginLeft: 80
    },
    date: {
      fontSize: 12,
      marginBottom: 10
    },
    freq: {
      fontFamily: "Segment7",
      fontSize: 30,
      cursor: 'pointer',
      display: 'inline-block',
    },
    rightBlock: {
      paddingLeft: 30,
      fontSize: 12
    },
    controls: {
      marginTop: 20,
    },
    control: {
      cursor: "pointer",
      display: 'inline-block',
      marginRight: 8
    },
    name: {
      fontWeight: 'bold'
    }
  };
  const {time, freq, file, size} = data;

  function getBackgroundColor() {
    let bg = "#FFF";

    if (listened) {
      bg = "#ffdfc1"
    }

    if (selected) {
      bg = "#f79c51";
    }

    return bg;
  }

  const freqItem = freqData.find(freqItem => freqItem.freq === freq);
  const freqItemIndex = freqData.findIndex(freqItem => freqItem.freq === freq);

  return (
    <div
      style={{
        ...styles.item,
        backgroundColor: getBackgroundColor()
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <div>
        <div style={styles.date}>
          {dayjs(time * 1000).format('h:mm:ss A M/D/YYYY')}
        </div>

        <div
          style={{...styles.freq, color: liked ? "#0c8e38" : "black"}}
          onClick={(event) => {
            if (!liked) {
              onLike();
            } else {
              onUnlike();
            }

            event.stopPropagation();
          }}
        >
          {freq}
        </div>
        <div style={styles.name}>
          {freqItem ? freqItem.name : ''}
        </div>
      </div>
      <div style={styles.rightBlock}>
        <div>
          <b>Duration:</b> {sec2time(size / 16000)}
        </div>
        <div>
          <b>Size:</b> {size / 1000}kb
        </div>
        <div style={styles.controls}>
          <div
            style={styles.control}
            onClick={(event) => {
              event.stopPropagation();
              if (hidden) {
                onUnhide();
              } else {
                if (!window.confirm(`Are you sure you want to hide this freq? [${freq}]`)) {
                  return false;
                }
                onHide();
              }
            }}
          >
            {hidden ? 'Unhide' : 'Hide'}
          </div>
          <div
            style={styles.control}
            onClick={async (event) => {
              event.stopPropagation();

              const name = prompt('Enter a name', freqItem ? freqItem.name : '');
              if (name === null) {
                return;
              }
              if (!freqItem) {
                setFreqData([
                  ...freqData,
                  {
                    name,
                    freq
                  }
                ])
              } else {
                const tmpFreqData = await produce(freqData, async (draft) => {
                  draft[freqItemIndex].name = name;
                });
                setFreqData(tmpFreqData);
              }
            }}
          >
            Rename
          </div>

          <div
            style={styles.control}
            onClick={async (event) => {
              event.stopPropagation();

              handleMarkRead(freq);
            }}
          >
            MarkRead
          </div>
        </div>

      </div>
      <div>
        {/*audio used to be here*/}
      </div>
    </div>
  );
}

export default Call; 
