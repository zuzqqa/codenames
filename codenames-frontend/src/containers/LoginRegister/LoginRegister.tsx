import React, { ReactNode } from "react";
import "./LoginRegister.css";

/**
 * Props interface for the LoginRegisterContainer component.
 */
interface LoginRegisterContainerProps {
  children: ReactNode; // Accepts strings, JSX, or any valid React nodes
}

/**
 * LoginRegisterContainer Component
 *
 * A container component that wraps its children with login/register-specific styling.
 *
 * @param {LoginRegisterContainerProps} props - The properties that define the LoginRegisterContainer component.
 * @returns {JSX.Element} The rendered login/register container.
 */
const LoginRegisterContainer: React.FC<LoginRegisterContainerProps> = ({ children }) => {
  return <div className="login-register-container">{children}</div>;
};

export default LoginRegisterContainer;
