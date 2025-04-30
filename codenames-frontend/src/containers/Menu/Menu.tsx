import React, { ReactNode } from "react";
import "./Menu.css";

/**
 * Props interface for the MenuContainer component.
 */
interface MenuContainerProps {
  children: ReactNode; // Accepts strings, JSX, or any valid React nodes
}

/**
 * MenuContainer Component
 *
 * A container component that wraps its children with menu-specific styling.
 *
 * @param {MenuContainerProps} props - The properties that define the MenuContainer component.
 * @returns {JSX.Element} The rendered menu container.
 */
const MenuContainer: React.FC<MenuContainerProps> = ({ children }) => {
  return <div className="menu-container">{children}</div>;
};

export default MenuContainer;
