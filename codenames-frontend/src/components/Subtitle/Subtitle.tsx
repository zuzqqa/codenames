import * as React from "react";
import { ReactNode } from "react";
import "./Subtitle.css";

/**
 * Props interface for the SubtitleComponent.
 */
interface SubtitleComponentProps {
    children: ReactNode; // Accepts strings, JSX, or any valid React nodes
    variant: "room" | "primary" | "start";
}

/**
 * SubtitleComponent
 *
 * A reusable subtitle component with shadow effect, supporting different styling variants.
 *
 * @component
 * @param {SubtitleComponentProps} props - The properties that define the SubtitleComponent.
 * @returns {JSX.Element} The rendered subtitle component.
 */
const SubtitleComponent: React.FC<SubtitleComponentProps> = ({ children, variant="primary" }) => {
    return (
        <div className={`${variant}-subtitle-container`}>
            <h1 className="subtitle">{children}</h1>
            <h1 className="subtitle-shadow">{children}</h1>
        </div>
    );
};

export default SubtitleComponent;
