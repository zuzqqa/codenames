import React, { ReactNode } from "react";
import "./Modal.css";
import TitleComponent from "../Title/Title";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <TitleComponent>{children}</TitleComponent>
            </div>
        </div>
    );
};

export default Modal;
