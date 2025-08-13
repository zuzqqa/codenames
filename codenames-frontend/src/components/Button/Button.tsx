import React, {ReactNode} from "react";
import "./Button.css";
import soundFile from "../../assets/sounds/old-radio-button-click-97549.mp3";

/**
 * Props interface for the Button component.
 */
interface ButtonProps {
    /** Content inside the button (text/icons) */
    children: ReactNode; 
    /** Click handler function (optional) */
    onClick?: () => void;
    /** Button type (default is "button") */
    type?: "button" | "submit" | "reset";
    /** Button variant for styles (default is "primary") */
    variant?: "primary" | "primary-1" | "room" | "circle"| "circle-profile" | "circle-back" | "session" | "help" | "eye" | "eye2" 
    | "logout" | "search" | "join-team" | "small" | "edit" | "navy-blue" | "transparent" | "half-circle" | "number-stepper"; // Button variant for styles (default is "primary")
    /** Disabled state (default is false) */
    disabled?: boolean; 
    /** Sound volume for the click effect */
    soundFXVolume: number; 
    /** Change handler function (optional) */
    onChange?: () => void; 
    /** Additional custom class names */
    className?: string;
}

/**
 * Plays a button click sound with adjusted volume.
 * @param volume The volume level for the sound effect (0-100).
 */
const playSound = (volume: number) => {
    const audio = new Audio(soundFile);
    audio.volume = volume / 100;
    audio.play();
};

/**
 * Button component with dynamic styling and sound effects.
 * @param {ButtonProps} props - The properties for the button component.
 * @returns {JSX.Element} A styled button element.
 */
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
