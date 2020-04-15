import React from "react";
import {secondary} from "./color";
import {useHover} from "./Utils";

export function BooleanOption({
                                title,
                                value,
                                onClick,
                                warning = false,
                                type = 'normal',
                                containerWidth,
                                fullWidth,
                              }
) {
  const [hoverRef, isHovered] = useHover();

  let width = type === 'small' ? 60 : (containerWidth / 2) - 4;

  if (fullWidth) {
    width = "100%";
  }

  const styles = {
    container: {
      padding: type === 'small' ? 3 : 6,
      display: "inline-block",
      boxSizing: "border-box",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: (type === 'small' || type === 'settings') && !fullWidth ? 8 : 0,
      width: width,
      borderRadius: 4,
      border: isHovered ? `1px solid ${secondary}` : '1px solid rgba(0,0,0,0)',
      textAlign: type === 'small' ? 'center' : 'left',
      boxShadow: "1px 1px 2px #999",
    }
  };

  let backgroundColor = "#c6e1d1";
  let color = secondary;

  if (value) {
    backgroundColor = '#284b34';
    color = "#FFF";
  }

  if (warning) {
    color = "#FFF";
    backgroundColor = "#f79c51"
  }

  return <div
    ref={hoverRef}
    style={{...styles.container, backgroundColor: backgroundColor, color: color}}
    onClick={onClick}
  >
    {title}
  </div>;
}
