import React, { ReactNode } from "react";
import "./Background.css";

/**
 * Props interface for the BackgroundContainer component.
 */
type BackgroundContainerProps = {
  children: ReactNode;
};

/**
 * BackgroundContainer Component
 *
 * A container component that wraps its children with a background styling.
 *
 * @param {BackgroundContainerProps} props - The properties that define the BackgroundContainer component.
 * @returns {JSX.Element} The rendered background container.
 */
const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
                                                                   children,
                                                                 }) => {
  return <div className="background-container">{children}</div>;
};

export default BackgroundContainer;
