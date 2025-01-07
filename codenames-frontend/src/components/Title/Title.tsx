import React, { useState, ReactNode, useEffect } from "react";
import "./Title.css";

// @ts-ignore
import soundFile from "../../assets/sounds/cinematic-hit-159487.mp3";

interface TitleComponentProps {
    children: ReactNode;
    soundFXVolume: number; 
}

const TitleComponent: React.FC<TitleComponentProps> = ({ children, soundFXVolume }) => {
    const [audio] = useState(() => new Audio(soundFile)); 

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
            <h1 className="title" onAnimationStart={handleAnimationStart}>
                {children}
            </h1>
            <h1 className="title-shadow">{children}</h1>
        </div>
    );
};

export default TitleComponent;
