import React, {ReactNode} from "react";
import "./Button.css";
import soundFile from "../../assets/sounds/old-radio-button-click-97549.mp3";

// ButtonProps interface defines the button's properties
interface ButtonProps {
    children: ReactNode; // Content inside the button (text/icons)
    onClick?: () => void; // Click handler function (optional)
    type?: "button" | "submit" | "reset"; // Button type (default is "button")
    variant?: "primary" | "primary-1" | "room" | "circle" | "circle-back" | "session" | "help" | "eye" | "eye2" | "search" | "join-team"; // Button variant for styles (default is "primary")
    disabled?: boolean; // Disabled state (default is false)
    soundFXVolume: number; // Sound volume for the click effect
    onChange?: () => void; // Change handler function (optional)
    className?: string;
}

// Function to play button click sound with adjusted volume
const playSound = (volume: number) => {
    const audio = new Audio(soundFile);
    audio.volume = volume / 100;
    audio.play().then();
};

// Button component with dynamic styling and sound on click
const Button: React.FC<ButtonProps> = ({
                                           children,
                                           onClick,
                                           type = "button",
                                           variant = "primary",
                                           disabled = false,
                                           soundFXVolume,
                                           className="",
                                           onChange
                                       }) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            type={type}
            onClick={() => {
                playSound(soundFXVolume); // Play sound on click
                if (onClick) onClick(); // Call onClick handler if provided
            }}
            disabled={disabled} // Disable button if true
            onChange={onChange}
        >
            {children} 
        </button>
    );
};

export default Button; // Export Button component
