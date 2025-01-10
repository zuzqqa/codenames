import React, { useState, ReactNode, useEffect } from "react";
import "./Title.css";

// @ts-ignore
import soundFile from "../../assets/sounds/cinematic-hit-159487.mp3";

interface TitleComponentProps {
    children: ReactNode;
    soundFXVolume: number;
    customStyle?: React.CSSProperties;
    shadowStyle?: React.CSSProperties;
}

const TitleComponent: React.FC<TitleComponentProps> = ({ children, soundFXVolume, customStyle, shadowStyle}) => {
    const [audio] = useState(() => new Audio(soundFile)); // Initialize audio only once

    const playHitSound = () => {
        audio.volume = soundFXVolume / 100;
        audio.play();
    };

    const handleAnimationStart = () => {
        playHitSound();
    };

    useEffect(() => {
        audio.volume = soundFXVolume / 100;
    }, [soundFXVolume, audio]);

    return (
        <div className="title-container">
            <h1 className="title" onAnimationStart={handleAnimationStart} style={customStyle}>
                {children}
            </h1>
            <h1 className="title-shadow" style={shadowStyle}>{children}</h1>
        </div>
    );
};

export default TitleComponent;
