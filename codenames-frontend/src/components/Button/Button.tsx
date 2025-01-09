import React, {ReactNode} from "react";
import "./Button.css";
import soundFile from "../../assets/sounds/old-radio-button-click-97549.mp3";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "room" | "circle" | "circle-back" | "session" | "help";
    disabled?: boolean;
    soundFXVolume: number;
}

const playSound = (volume: number) => {
    const audio = new Audio(soundFile);
    audio.volume = volume / 100;
    audio.play();
};

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           onClick,
                                           type = "button",
                                           variant = "primary",
                                           disabled = false,
                                           soundFXVolume
                                       }) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            type={type}
            onClick={() => {
                playSound(soundFXVolume);
                if (onClick) onClick();
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
