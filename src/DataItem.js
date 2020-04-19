import React from "react";
import {primary, primary2, primary3, primary4} from "./color";
import {useWindowSize} from "./hooks/useWindowSize";

export function DataItem({title, value, type}) {
  const windowSize = useWindowSize();

  const styles = {
    container: {
      backgroundColor: "#FFF",
      width: windowSize.width >= 600 ? 150 : "100%",
      textAlign: "center",
      border: `1px solid ${primary}`,
      borderRadius: 6,
      marginRight: windowSize.width >= 600 ? 8 : 0,
      padding: 6,
      color: primary4,
      boxShadow: '1px 2px 3px #eabe95'
    },
    title: {
      fontSize: 14,
      // fontWeight: 500,
      marginBottom: 2,
    },
    value: {
      fontSize: 24,
      fontWeight: 500,
    },
    type: {
      fontSize: 18,
      marginLeft: 4
    }
  };

  return (
    <div
      style={styles.container}
    >
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}<span style={styles.type}>{type}</span></div>
    </div>
  );
}
