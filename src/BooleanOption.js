import React from "react";

export function BooleanOption({title, value, onClick, warning = false, type = 'normal'}) {
  const styles = {
    container: {
      padding: 6,
      display: "inline-block",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: 8,
      width: type === 'small' ? 70 : 120,
      borderRadius: 4,
      textAlign: type === 'small'? 'center' : 'left'
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
