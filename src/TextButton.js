import React from "react";
import {useHover} from "./Utils";

export function TextButton({title, onClick}) {
  const [hoverRef, isHovered] = useHover();

  const styles = {
    container: {
      cursor: "pointer",
      display: "inline-block",
      fontSize: 14,
      textDecoration: isHovered?"underline":'none',
      marginRight: 8
    }
  };

  return <div
    onClick={onClick}
    ref={hoverRef}
    style={styles.container}
  >
    {title}
  </div>;
}
