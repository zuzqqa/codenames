import React, { useEffect } from "react";
import { useToast } from "./ToastContext.tsx";
import "./Toast.css";

interface ToastProps {
    id: string;
    message: string;
    variant: "error" | "notification";
}

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
                <div className={`toast active`} id={id}>
                    <div className={`toast-content`}>
                        <i
                            className="fa fa-exclamation-circle fa-3x"
                            style={{color: "#561723"}}
                            aria-hidden="true"
                        ></i>
                        <div className="message">
                            <span className="text text-1">{variant}</span>
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