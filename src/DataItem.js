import React from "react";
import {primary, primary2, primary3, primary4} from "./color";

export function DataItem({title, value, type}) {
  const styles = {
    container: {
      backgroundColor: "#FFF",
      width: 150,
      textAlign: "center",
      border: `1px solid ${primary}`,
      borderRadius: 6,
      marginRight: 8,
      padding: 6,
      color: primary4,
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
