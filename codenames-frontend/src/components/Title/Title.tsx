import React, { useState, ReactNode, useEffect } from "react";
import "./Title.css";

// @ts-ignore
import soundFile from "../../assets/sounds/cinematic-hit-159487.mp3";

/**
 * Props interface for the TitleComponent.
 */
interface TitleComponentProps {
    children: ReactNode;
    soundFXVolume: number;
    customStyle?: React.CSSProperties;
    shadowStyle?: React.CSSProperties;
    variant?: string;
}

/**
 * TitleComponent
 *
 * A title component that plays a sound effect when the animation starts.
 *
 * @param {TitleComponentProps} props - The properties that define the TitleComponent.
 * @returns {JSX.Element} The rendered title component.
 */
const TitleComponent: React.FC<TitleComponentProps> = ({ children, soundFXVolume, customStyle, shadowStyle, variant }) => {
    const [audio] = useState(() => new Audio(soundFile)); // Initialize audio only once

    /**
     * Plays the sound effect with the current volume setting.
     */
    const playHitSound = () => {
        audio.volume = soundFXVolume / 100;
        audio.play();
    };

    /**
     * Handles animation start event and triggers sound playback.
     */
    const handleAnimationStart = () => {
        playHitSound();
    };

    /**
     * Updates the audio volume whenever the soundFXVolume changes.
     */
    useEffect(() => {
        audio.volume = soundFXVolume / 100;
    }, [soundFXVolume, audio]);

    return (
        <div className="title-container">
            <h1 className={ variant || "title" } onAnimationStart={handleAnimationStart} style={customStyle}>
                {children}
            </h1>
            <h1 className={ variant ? variant + "-shadow" : "title-shadow" } style={shadowStyle}>{children}</h1>
        </div>
    );
};

export default TitleComponent;
