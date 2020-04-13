import React from "react";
import {primary, primary4} from "./color";

export function DataItem({title, value}) {
  const styles = {
    container: {
      width: 150,
      textAlign: "center"
    },
    title: {
      fontSize: 12,
      color: primary4
    },
    value: {
      fontSize: 18,
      color: primary4
    }
  };

  return (
    <div
      style={styles.container}
    >
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}
