import React from "react";

export function BooleanOption({
                                title,
                                value,
                                onClick,
                                warning = false,
                                type = 'normal',
                                containerWidth
                              }
) {
  console.log(containerWidth)
  const styles = {
    container: {
      padding: type === 'small' ? 3 : 6,
      display: "inline-block",
      boxSizing: "border-box",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: type === 'small' ? 8 : 0,
      width: type === 'small' ? 60 : (containerWidth / 2) - 4,
      borderRadius: 4,
      textAlign: type === 'small' ? 'center' : 'left'
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
