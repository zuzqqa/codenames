import React from "react";
import "./Subtitle.css";

function SubtitleComponent({ children }) {
  return (
    <div className="subtitle-container">
      <h1 className="subtitle">{children}</h1>
      
      <h1 className="subtitle-shadow">{children}</h1>
    </div>
  );
}

export default SubtitleComponent;
