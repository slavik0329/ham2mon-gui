import React from "react";
import dayjs from "dayjs";
import {useWindowSize} from "./Utils";

export function NowPlaying({call, freqData}) {
  const windowSize = useWindowSize();

  const styles = {
    container: {
      color: '#284b34',
      display: "flex",
      justifyContent: "center",
      paddingTop: windowSize.width >= 600 ? "0" : 10,
    },
    freq: {
      color: '#f79c51',
      fontFamily: "Segment7",
      fontSize: 30,
      marginBottom: 8
    },
    date: {
      fontSize: 12,
      marginBottom: 10
    },
    name: {
      fontWeight: 'bold'
    },
    rightBlock: {
      paddingLeft: 20
    },
    nowPlaying: {
      textAlign: "center",
      fontWeight: 600,
      fontSize: 12,
      marginBottom: 8
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
   <div>
     <div style={styles.nowPlaying}>
       Now Playing
     </div>

     <div style={styles.freq}>
       {callInfo.freq}
     </div>
   </div>
    <div style={styles.rightBlock}>
      <div style={styles.date}>
        {callInfo.time?dayjs(callInfo.time * 1000).format('h:mm:ss A M/D/YYYY'):null}
      </div>
      <div style={styles.name}>
        {freqItem ? freqItem.name : ''}
      </div>
    </div>
  </div>;
}
