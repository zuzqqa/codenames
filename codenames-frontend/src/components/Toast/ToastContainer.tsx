import React from "react";
import { useToast } from "./ToastContext";
import Toast from "./Toast";

const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    variant={toast.variant}
                />
            ))}
        </div>
    );
};

export default ToastContainer;