import React from "react";

import "./Modal.css";

import BackgroundImage from "../../assets/images/main-page-container.png";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <img
          src={ BackgroundImage }
          alt="Background"
          className="modal-image"
        />
        {children}
      </div>
    </div>
  );
}

export default Modal;
