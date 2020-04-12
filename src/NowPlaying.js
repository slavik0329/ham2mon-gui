import React from "react";
import dayjs from "dayjs";
import {useWindowSize} from "./Utils";

export function NowPlaying({call, freqData}) {
  const windowSize = useWindowSize();

  const styles = {
    container: {
      color: 'rgb(198, 225, 209)',
      backgroundColor: 'rgb(40, 75, 52)',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: "center",
      marginTop: windowSize.width >= 600 ? "0" : 10,
      marginBottom: 10,
      height: 104
    },
    innerBlock: {
      display: "flex",

    },
    freq: {
      color: 'rgb(198, 225, 209)',
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 30,
      textAlign: "center"
    },
    date: {
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 23,
      marginTop: 12,
      marginBottom: 10,
      textAlign: 'right'
    },
    name: {
      fontWeight: '500',
      textAlign: "center"
    },
    rightBlock: {
      paddingLeft: 20,
      paddingRight: 14,
      marginLeft: 40,
      width: "100%"
    },
    leftBlock: {
      paddingLeft: 14,
      flexGrow: '1'
    },
    frequency: {
      textAlign: "center",
      fontWeight: 500,
      fontSize: 12,
      marginBottom: 8,
      marginTop: 10
    }
  };

  let callInfo = {
    file: "Not Playing",
    freq: <div style={{}}>NOT PLAYING</div>,
    time: 0
  };

  if (call) {
    callInfo = call;
  }

  const freqItem = freqData.find(freqItem => freqItem.freq === callInfo.freq);

  return <div style={styles.container}>
    <div style={styles.innerBlock}>
      <div style={styles.leftBlock}>
        <div style={styles.frequency}>
          {call?'Now Playing':''}
        </div>

        <div style={styles.freq}>
          {callInfo.freq}
        </div>
      </div>
      {call ? <div style={styles.rightBlock}>
        <div style={styles.date}>
          <div>{callInfo.time ? dayjs(callInfo.time * 1000).format('M-D-YYYY') : null}</div>
          <div>{callInfo.time ? dayjs(callInfo.time * 1000).format('hh:mm:ss ') : null}</div>
        </div>
      </div> : null}
    </div>
    <div style={styles.name}>
      {freqItem ? freqItem.name : ''}
    </div>
  </div>;
}
