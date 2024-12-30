import React from "react";

import "./Button.css";

import soundFile from "../../assets/sounds/old-radio-button-click-97549.mp3";

const playSound = () => {
  const audio = new Audio(soundFile);
  audio.play();
};

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      type={type}
      onClick={() => {
        playSound();
        onClick && onClick();
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
