import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {isChrome} from "./Utils";
import {secondary, secondary25} from "./color";
import {useWindowSize} from "./hooks/useWindowSize";

export function NowPlaying({call, freqData}) {
  const windowSize = useWindowSize();

  const styles = {
    container: {
      color: secondary25,
      backgroundColor: secondary,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: "center",
      marginTop: windowSize.width >= 600 ? "0" : 10,
      marginBottom: 10,
      height: 112,
      boxShadow: "1px 1px 2px #999",
    },
    innerBlock: {
      display: "flex",

    },
    freq: {
      color: secondary25,
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 30,
      textAlign: "center",
    },
    date: {
      fontFamily: "Segment7",
      fontWeight: 'normal',
      fontStyle: 'italic',
      fontSize: 23,
      marginTop: 12,
      marginBottom: 10,
      textAlign: 'right',
      width: windowSize.width >= 600 ? "auto" : 135
    },
    name: {
      fontWeight: '500',
      fontStyle: 'italic',
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
    nowPlaying: {
      textAlign: "center",
      fontWeight: 500,
      fontSize: 12,
      marginBottom: 8,
      marginTop: 10,
      opacity: 0.5
    }
  };
  const [tickOn, setTickOn] = useState(true);

  const tickRef = useState(true);

  function tick() {
    tickRef.current = !tickRef.current;

    setTickOn(tickRef.current);
    setTimeout(tick, 1000);

  }

  useEffect(() => {
    tick();
  }, []);

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
        <div style={styles.nowPlaying}>
          {call ? 'Now Playing' : ''}
        </div>

        <div style={styles.freq}>
          {callInfo.freq}
        </div>
      </div>
      {call ? <div style={styles.rightBlock}>
        <div style={styles.date}>
          <div>{callInfo.time ? dayjs(callInfo.time * 1000).format('M-D-YYYY') : null}</div>
          <div>{callInfo.time ? dayjs(callInfo.time * 1000).format(tickOn ? 'HH:mm:ss' : 'HH mm ss') : null}</div>
        </div>
      </div> : null}
    </div>
    <div style={styles.name}>
      {isChrome ? <marquee scrollamount={4} behavior={'scroll'}>
        {freqItem ? freqItem.name : call ? 'NO NAME' : ''}
      </marquee> : <div>{freqItem ? freqItem.name : ''}</div>}

    </div>
  </div>;
}
