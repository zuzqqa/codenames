import React from "react";

import "./TitleModal.css";

function TitleModal({ children }) {
  return (
    <div className="title-container">
      <h1 className="title">{children}</h1>
      <h1 className="title-shadow">{children}</h1>
    </div>
  );
}

export default TitleModal;
