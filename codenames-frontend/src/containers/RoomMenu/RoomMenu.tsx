import React, { ReactNode } from "react";
import "./RoomMenu.css";

// Define prop types
interface RoomMenuContainerProps {
  children: ReactNode; // Accepts strings, JSX, or any valid React nodes
}

const RoomMenuContainer: React.FC<RoomMenuContainerProps> = ({ children }) => {
  return <div className="room-menu-container">{children}</div>;
};

export default RoomMenuContainer;
