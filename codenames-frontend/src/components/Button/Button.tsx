import React, { ReactNode } from "react";
import "./Button.css";
import soundFile from "../../assets/sounds/old-radio-button-click-97549.mp3";

/**
 * Props interface for the Button component.
 */
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "primary-1"
    | "primary-2"
    | "room"
    | "circle"
    | "circle-profile"
    | "circle-back"
    | "session"
    | "help"
    | "eye"
    | "eye2"
    | "logout"
    | "search"
    | "join-team"
    | "small"
    | "edit"
    | "navy-blue"
    | "transparent"
    | "half-circle"
    | "number-stepper"
    | "discord"
    | "tutorial"
    | "google"; 
  disabled?: boolean;
  soundFXVolume: number;
  onChange?: () => void;
  className?: string;
  style?: React.CSSProperties;
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
  className = "",
  onChange,
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
      onChange={onChange}
    >
      {children}
    </button>
  );
};

export default Button; 
