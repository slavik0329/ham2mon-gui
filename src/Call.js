import React from 'react';
import dayjs from "dayjs";

import {FaRegClock, FaRegHdd} from 'react-icons/fa';
import produce from "immer"
import {sec2time} from "./Utils";
import {primary2, primary4, secondary2, secondary25} from "./color";
import {SmallDataBlock} from "./SmallDataBlock";
import {TextButton} from "./TextButton";
import {useHover} from "./hooks/useHover";

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
              }) {
  const [hoverRef, isHovered] = useHover();

  const styles = {
    item: {
      border: `1px solid #eee`,
      padding: "4px 6px",
      margin: "4px 4px",
      display: 'flex',
      borderRadius: 4,
      cursor: 'pointer',
    },
    audioBlock: {marginTop: 10},
    audio: {
      width: 400,
      marginLeft: 80
    },
    date: {
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 15,
      marginBottom: 10,
      marginTop: 9,
      textAlign: 'right'
    },
    freq: {
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 30,
      cursor: 'pointer',
      display: 'inline-block',
      textAlign: "right",
      width: 106
    },
    rightBlock: {
      paddingLeft: 30,
      fontSize: 12
    },
    controls: {
      marginTop: 4
    },
    control: {
      cursor: "pointer",
      display: 'inline-block',
      marginRight: 8,
    },
    name: {
      fontWeight: '500',
      fontSize: 16,
      marginTop: 4
    },
    infoBlock: {
      fontSize: 13,
      marginTop: 4,
      marginBottom: 14
    }
  };
  const {time, freq, file, size} = data;

  let color = primary4;
  let bg = "#FFF";
  let border = '1px solid #EEE';

  if (size / 16000 > 10) {
    bg = secondary2;
  }

  if (listened) {
    bg = primary2;
  }

  if (isHovered) {
    border= '1px solid #ccc';
  }

  if (selected) {
    border = "2px solid #f79c51";
  }

  const freqItem = freqData.find(freqItem => freqItem.freq === freq);
  const freqItemIndex = freqData.findIndex(freqItem => freqItem.freq === freq);

  return (
    <div
      ref={hoverRef}
      style={{
        ...styles.item,
        color: color,
        backgroundColor: bg,
        border: border
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <div style={styles.leftBlock}>
        <div style={styles.date}>
          <div>
            {dayjs(time * 1000).format('M-D-YYYY')}
          </div>
          <div>
            {dayjs(time * 1000).format('HH:mm:ss')}
          </div>
        </div>

        <div
          style={{...styles.freq, color: liked ? primary4 : '#ccc',}}
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
      </div>
      <div style={styles.rightBlock}>
        <div style={styles.name}>
          {freqItem ? freqItem.name : 'NO NAME'}
        </div>
        <div style={styles.infoBlock}>
          <SmallDataBlock
            Icon={FaRegClock}
            data={sec2time(size / 16000)}
          />

          <SmallDataBlock
            Icon={FaRegHdd}
            data={`${size / 1000}kb`}
          />
        </div>
        <div style={styles.controls}>
          <TextButton
            title={hidden ? 'Unhide' : 'Hide'}
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
          />

          <TextButton
            title={'Rename'}
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
          />
        </div>
      </div>
    </div>
  );
}

export default Call; 
