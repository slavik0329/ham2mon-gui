import React from "react";

export function BooleanOption({title, value, onClick, warning = false}) {
  const styles = {
    container: {
      padding: 6,
      display: "inline-block",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: 8,
      width: 120,
      borderRadius: 4
    }
  };

  let backgroundColor = !value ? "#c6e1d1" : "#9df99f";

  let color = "#000";

  if (warning) {
    color = "#FFF";
    backgroundColor = "#284b34"
  }

  return <div
    style={{...styles.container, backgroundColor: backgroundColor, color: color}}
    onClick={onClick}
  >
    {title}
  </div>;
}
