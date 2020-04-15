import React from "react";
import {primary4} from "./color";

export function SmallDataBlock({Icon, data}) {
  const styles = {
    container: {
      display: "inline-block",
      marginRight: 8,
      color: primary4
    },
    icon: {
      marginRight: 2,
      width: 12,
      height: 12,
      position:'relative',
      top: 1
    },
    data: {
      marginLeft: 2
    }
  };

  return <div style={styles.container}>
    <Icon
      style={styles.icon}
    />
    <span
      style={styles.data}
    >
      {data}
    </span>
  </div>;
}
