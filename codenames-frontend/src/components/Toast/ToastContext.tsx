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

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const addToast = (message: string, variant: "error" | "notification") => {
        const id = generateId();
        console.log("Adding toast:", { id, message, variant }); // Debug log
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

export const useToast = (): ToastContextProps => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};