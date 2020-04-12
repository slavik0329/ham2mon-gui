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
      display: "flex",
      padding: "6px 0 6px 0px",
      justifyContent: "center",
      marginTop: windowSize.width >= 600 ? "0" : 10,
      marginBottom: 10
    },
    freq: {
      color: 'rgb(198, 225, 209)',
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 30,
      marginBottom: 8
    },
    date: {
      fontSize: 12,
      marginTop: 12,
      marginBottom: 10
    },
    name: {
      fontWeight: 'bold'
    },
    rightBlock: {
      paddingLeft: 20,
      marginLeft: 40
    },
    nowPlaying: {
      textAlign: "center",
      fontWeight: 600,
      fontSize: 12,
      marginBottom: 8,
      marginTop: 10
    }
  };

  let callInfo = {
    file: "Not Playing",
    freq: "NOT PLAYING",
    time: 0
  };

  if (call) {
    callInfo = call;
  }

  const freqItem = freqData.find(freqItem => freqItem.freq === callInfo.freq);

  return <div style={styles.container}>
    <div style={styles.leftBlock}>
      <div style={styles.nowPlaying}>
        Now Playing
      </div>

      <div style={styles.freq}>
        {callInfo.freq}
      </div>
    </div>
    <div style={styles.rightBlock}>
      <div style={styles.date}>
        {callInfo.time ? dayjs(callInfo.time * 1000).format('h:mm:ss A M/D/YYYY') : null}
      </div>
      <div style={styles.name}>
        {freqItem ? freqItem.name : ''}
      </div>
    </div>
  </div>;
}
