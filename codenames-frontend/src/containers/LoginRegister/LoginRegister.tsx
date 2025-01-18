import React, { ReactNode } from "react";
import "./LoginRegister.css";

// Define prop types
interface RoomMenuContainerProps {
  children: ReactNode; // Accepts strings, JSX, or any valid React nodes
}

const LoginRegisterContainer: React.FC<RoomMenuContainerProps> = ({ children }) => {
  return <div className="login-register-container">{children}</div>;
};

export default LoginRegisterContainer;
