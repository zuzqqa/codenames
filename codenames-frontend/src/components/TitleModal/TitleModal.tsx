import * as React from "react";
import "./TitleModal.css";
import {ReactNode} from "react";

// Define prop types
interface TitleModalProps {
  children: ReactNode; // Accepts valid React child elements like string, JSX, etc.
}

const TitleModal: React.FC<TitleModalProps> = ({ children }) => {
    return (
        <div className="title-container1">
            <h1 className="title1">{children}</h1>
            <h1 className="title-shadow1">{children}</h1>
        </div>
    );
};

export default TitleModal;