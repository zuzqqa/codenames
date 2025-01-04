import * as React from "react";
import { ReactNode } from "react";
import "./Subtitle.css";

// Define prop types
interface SubtitleComponentProps {
    children: ReactNode; // Accepts strings, JSX, or any valid React nodes
    variant: "room" | "primary";
}

const SubtitleComponent: React.FC<SubtitleComponentProps> = ({ children, variant="primary" }) => {
    return (
        <div className={`${variant}-subtitle-container`}>
            <h1 className="subtitle">{children}</h1>
            <h1 className="subtitle-shadow">{children}</h1>
        </div>
    );
};

export default SubtitleComponent;
