import React from "react";

interface PrivateRouteProps {
  element: JSX.Element;
  isAuthenticated: boolean | null;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, isAuthenticated }) => {
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  return element;
};

export default PrivateRoute;
