import React from "react";

import "./Modal.css";

import TitleComponent from "../Title/Title";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <TitleComponent className="modal-title"></TitleComponent>
        {children}
      </div>
    </div>
  );
}

export default Modal;
