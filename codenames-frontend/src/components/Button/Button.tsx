import {ReactNode} from "react";
import "./Button.css";
import soundFile from "../../assets/sounds/old-radio-button-click-97549.mp3";

const playSound = () => {
    const audio = new Audio(soundFile);
    audio.play();
};

interface ButtonProps {
    children: ReactNode,
    onClick?: () => void,
    type?: "button" | "submit" | "reset",
    variant?: "primary" | "room" | "circle" | "circle-back" | "session",
    disabled?: boolean,
    className?: string
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           onClick,
                                           type = "button",
                                           variant = "primary",
                                           disabled = false,
                                           className
                                       }) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            type={type}
            onClick={() => {
                playSound();
                if (onClick) onClick();
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
