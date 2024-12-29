import React from "react";

import "./TitleModal.css";

function TitleModal({ children }) {
  return (
    <div className="title-container1">
      <h1 className="title1">{children}</h1>
      <h1 className="title-shadow1">{children}</h1>
    </div>
  );
}

export default TitleModal;
