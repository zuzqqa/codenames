import React, { ReactNode } from "react";
import BackgroundImg from "../../assets/images/profile-container.png";

import "./Modal.css";

/**
 * Props for the Modal component.
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Determines if the modal is open.
 * @property {Function} onClose - Function to close the modal.
 * @property {ReactNode} children - Modal content.
 * @property {string} variant - Variant for styling.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    variant?: "default" | "large";
}

/**
 * Modal component that displays a customizable modal dialog.
 * @param {ModalProps} props - Component properties.
 * @returns {JSX.Element | null} The rendered Modal component.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, variant = "default" }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <img src={ BackgroundImg } className={`modal-background-img modal-background-img-${variant}`} alt="Modal background" />
            <div className={`modal-content modal-content-${variant}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default Modal;
