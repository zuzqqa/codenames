import React, { useEffect } from "react";
import { useToast } from "./ToastContext.tsx";
import "./Toast.css";

interface ToastProps {
  id: string;
  message: string;
  variant: "error" | "notification";
}

/**
 * Toast component displays a brief message to the user.
 * It automatically fades out and removes itself after a delay.
 */
const Toast: React.FC<ToastProps> = ({ id, message, variant }) => {
  const { removeToast } = useToast();

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hide");
    }, 8000);

    const removeTimer = setTimeout(() => {
      removeToast(id);
    }, 8500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [id, removeToast]);

  return (
    <div className="toast active" id={id}>
      <div className="toast-content">
        <i
          className={`fa fa-${variant === "error" ? "exclamation-circle" : "info-circle"} fa-3x`}
          style={{ color: `${variant === "error" ? "#561723" : "#1B74BB"}` }}
          aria-hidden="true"
        ></i>
        <div className="message">
                    <span className="text text-1">
                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </span>
          <span className="text text-2">{message}</span>
        </div>
        <i
          className="fa-solid fa-xmark close"
          onClick={() => removeToast(id)}
        ></i>
        <div className="progress active"></div>
      </div>
    </div>
  );
};

export default Toast;
