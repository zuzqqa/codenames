import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
    id: string;
    message: string;
    variant: "error" | "notification";
}

interface ToastContextProps {
    toasts: Toast[];
    addToast: (message: string, variant: "error" | "notification") => void;
    removeToast: (id: string) => void;
}

/**
 * A React context object that stores the state and handlers related to toast notifications.
 * It is provided via the `ToastProvider` component and can be accessed using the `useToast` hook.
 */
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

/**
 * A context provider component that wraps its children and provides toast-related functionality.
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const addToast = (message: string, variant: "error" | "notification") => {
        const id = generateId();
        setToasts((prev) => prev.filter((toast) => toast.message !== message));
        setToasts((prev) => [...prev, { id, message, variant }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

/**
 * A custom hook that provides access to the toast context.
 */
export const useToast = (): ToastContextProps => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};