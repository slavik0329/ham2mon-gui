import React from "react";
import {primary} from "./color";
import {DataItem} from "./DataItem";

/**
 * @return {null}
 */
export function Settings({visible, dirSize, freeSpace}) {
  const styles = {
    outerContainer: {
      position: "fixed",
      padding: 20,
      width: "100%",
      zIndex: 2000,
      boxSizing: "border-box",
      backgroundColor: "#00000055",
      height: '100%'
    },
    container: {
      backgroundColor: "#FFF",
      padding: 20,
      width: "100%",
      zIndex: 2000,
      boxSizing: "border-box",
      border: "1px solid #EEE",
      borderRadius: '0 0 6px 6px'
    },
    titleBar: {
      backgroundColor: primary,
      color: "#FFF",
      fontSize: 24,
      padding: 8,
      borderRadius: '6px 6px 0 0'
    },
    dataItems: {
      display: "flex"
    }
  };

  return visible ? (
    <div
      style={styles.outerContainer}
    >
      <div style={styles.titleBar}>Settings</div>
      <div
        style={styles.container}
      >
        <div style={styles.dataItems}>
          <DataItem
            title="WAV directory size"
            value={`${(dirSize/1024/1024).toFixed(2)}MB`}
          />

          <DataItem
            title="Disk space availeble"
            value={`${(freeSpace/1024/1024).toFixed(2)}MB`}
          />
        </div>
      </div>
    </div>
  ) : null;
}
