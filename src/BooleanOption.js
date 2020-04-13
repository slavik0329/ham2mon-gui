import React, {useEffect, useRef, useState} from "react";
import {secondary} from "./color";

function useHover() {
  const [value, setValue] = useState(false);

  const ref = useRef(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);

        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );

  return [ref, value];
}

export function BooleanOption({
                                title,
                                value,
                                onClick,
                                warning = false,
                                type = 'normal',
                                containerWidth
                              }
) {
  const [hoverRef, isHovered] = useHover();

  const styles = {
    container: {
      padding: type === 'small' ? 3 : 6,
      display: "inline-block",
      boxSizing: "border-box",
      cursor: "pointer",
      marginBottom: 4,
      marginRight: type === 'small' || type === 'settings' ? 8 : 0,
      width: type === 'small' ? 60 : (containerWidth / 2) - 4,
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
