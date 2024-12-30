import React, { ReactNode } from "react";
import "./Modal.css";
import TitleComponent from "../Title/Title";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

// Functional Component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <TitleComponent className="modal-title" />
                {children}
                <button className="modal-close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
