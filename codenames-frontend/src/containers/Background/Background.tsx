import React, { ReactNode } from "react";
import "./Background.css";

type BackgroundContainerProps = {
  children: ReactNode;
};

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children }) => {
  return <div className="background-container">{children}</div>;
};

export default BackgroundContainer;