import React, { ReactNode } from "react";
import "./TitleModal.css";

// Define prop types
interface TitleModalProps {
    children: ReactNode; // Accepts valid React child elements like string, JSX, etc.
}

const TitleModal: React.FC<TitleModalProps> = ({ children }) => {
    return (
        <div className="title-container">
            <h1 className="title">{children}</h1>
            <h1 className="title-shadow">{children}</h1>
        </div>
    );
};

export default TitleModal;
