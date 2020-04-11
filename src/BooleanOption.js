import React from "react";

export function BooleanOption({title, value, onClick}) {
  const styles = {
    container: {
      padding: 6,
      display: "inline-block",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: 8,
      width: 140
    }
  };

  return <div
    style={{...styles.container, backgroundColor: !value?"#EEE":"#9df99f"}}
    onClick={onClick}
  >
    {title}
  </div>;
}
