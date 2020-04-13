import React from "react";
import {primary, primary4} from "./color";

export function DataItem({title, value}) {
  const styles = {
    container: {
      width: 150,
      textAlign: "center",
      border: `2px solid ${primary}`,
      borderRadius: 6,
      marginRight: 8,
      color: primary,
      padding: 6
    },
    title: {
      fontSize: 12,
      fontWeight: 500
    },
    value: {
      fontSize: 18,
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
