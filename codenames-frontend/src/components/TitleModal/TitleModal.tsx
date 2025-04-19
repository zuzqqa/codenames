import * as React from "react";
import "./TitleModal.css";
import {ReactNode} from "react";

/**
 * Props interface for the TitleModal component.
 */
interface TitleModalProps {
  children: ReactNode; // Accepts valid React child elements like string, JSX, etc.
  variant?: "default" | "small";
}

/**
 * TitleModal Component
 *
 * A modal title component that renders stylized text with a shadow effect.
 *
 * @param {TitleModalProps} props - The properties that define the TitleModal component.
 * @returns {JSX.Element} The rendered title modal.
 */
const TitleModal: React.FC<TitleModalProps> = ({ children, variant = "default" }) => {
    return (
        <div className="title-container-modal">
            <h1 className={`title-modal title-modal-${variant}`}>{children}</h1>
            <h1 className={`title-shadow-modal title-shadow-modal-${variant}`}>{children}</h1>
        </div>
    );
};

export default TitleModal;