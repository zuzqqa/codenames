import React from "react";
import { useToast } from "./ToastContext";
import Toast from "./Toast";

/**
 * ToastContainer component that renders a list of Toast components.
 */
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