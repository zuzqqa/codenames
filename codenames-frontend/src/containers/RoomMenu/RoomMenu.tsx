import React, { ReactNode } from "react";
import "./RoomMenu.css";

/**
 * Props interface for the RoomMenuContainer component.
 */
interface RoomMenuContainerProps {
  children: ReactNode; // Accepts strings, JSX, or any valid React nodes
}

/**
 * RoomMenuContainer Component
 *
 * A container component that wraps its children with room menu-specific styling.
 *
 * @param {RoomMenuContainerProps} props - The properties that define the RoomMenuContainer component.
 * @returns {JSX.Element} The rendered room menu container.
 */
const RoomMenuContainer: React.FC<RoomMenuContainerProps> = ({ children }) => {
  return <div className="room-menu-container">{children}</div>;
};

export default RoomMenuContainer;
