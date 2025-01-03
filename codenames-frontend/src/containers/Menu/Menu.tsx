import React, { ReactNode } from "react";
import "./Menu.css";

// Define prop types
interface MenuContainerProps {
  children: ReactNode; // Accepts strings, JSX, or any valid React nodes
}

const MenuContainer: React.FC<MenuContainerProps> = ({ children }) => {
  return <div className="menu-container">{children}</div>;
};

export default MenuContainer;
