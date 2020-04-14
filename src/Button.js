import {primary} from "./color";
import React from "react";

export function Button({title, onClick}) {
  return <div
    onClick={onClick}
    style={{
      backgroundColor: primary,
      color: "#FFF",
      display: "inline-block",
      padding: 7,
      cursor: "pointer"
    }}
  >
    {title}
  </div>;
}
