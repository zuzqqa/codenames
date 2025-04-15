import React, { ReactNode } from "react";

import BackgroundImg from "../../assets/images/main-page-container.png";

import "./Modal.css";

/**
 * Props for the Modal component.
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Determines if the modal is open.
 * @property {Function} onClose - Function to close the modal.
 * @property {ReactNode} children - Modal content.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

/**
 * Modal component that displays a customizable modal dialog.
 * @param {ModalProps} props - Component properties.
 * @returns {JSX.Element | null} The rendered Modal component.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <img src={ BackgroundImg } className="modal-background-img" alt="Modal background" />
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default Modal;