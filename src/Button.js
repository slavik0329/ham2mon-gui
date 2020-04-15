import {primary, primary4} from "./color";
import React from "react";

export function Button({title, onClick, type, secondary}) {
  return <div
    onClick={onClick}
    style={{
      backgroundColor: secondary?"#FFF":primary,
      color: secondary?primary4:"#FFF",
      border: secondary?`1px solid ${primary}`:'none',
      display: "inline-block",
      padding: 7,
      cursor: "pointer",
      borderRadius: type === 'input' ? "0 4px 4px 0" : 4,
      position: "relative",
      top: 1,
      boxShadow: '0px 2px 3px #eabe95'

    }}
  >
    {title}
  </div>;
}
