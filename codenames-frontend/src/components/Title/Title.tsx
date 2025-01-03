import React, { useState, ReactNode } from "react";
import "./Title.css";

// @ts-ignore
import soundFile from "../../assets/sounds/cinematic-hit-159487.mp3";

// Define prop types
interface TitleComponentProps {
    children: ReactNode; // Accepts string, JSX, or other React nodes
}

const TitleComponent: React.FC<TitleComponentProps> = ({ children }) => {
    const [audio] = useState(() => new Audio(soundFile)); // Initialize audio only once

    const playHitSound = () => {
        audio.volume = 0.3;
        audio.play();
    };

    const handleAnimationStart = () => {
        playHitSound();
    };

    return (
        <div className="title-container">
            <h1 className="title" onAnimationStart={handleAnimationStart}>
                {children}
            </h1>
            <h1 className="title-shadow">{children}</h1>
        </div>
    );
};

export default TitleComponent;
