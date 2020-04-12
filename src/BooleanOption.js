import React from "react";

export function BooleanOption({title, value, onClick, warning = false, type = 'normal'}) {
  const styles = {
    container: {
      padding: type === 'small'?3:6,
      display: "inline-block",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: 8,
      width: type === 'small' ? 60 : 120,
      borderRadius: 4,
      textAlign: type === 'small'? 'center' : 'left'
    }
  };

  let backgroundColor = "#c6e1d1";
  let color = "#000";

  if (value) {
    backgroundColor = '#284b34';
    color = "#FFF";
  }

  if (warning) {
    color = "#FFF";
    backgroundColor = "#f79c51"
  }

  return <div
    style={{...styles.container, backgroundColor: backgroundColor, color: color}}
    onClick={onClick}
  >
    {title}
  </div>;
}
