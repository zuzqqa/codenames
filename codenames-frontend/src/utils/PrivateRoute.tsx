import React from "react";
import { Navigate } from "react-router-dom";

// Defining the type for the props of the PrivateRoute component
interface PrivateRouteProps {
  element: JSX.Element;  // The element that should be rendered if the user is authenticated
  isAuthenticated: boolean | null;  // The authentication status: true if authenticated, false if not, null if still checking
}

// PrivateRoute component that wraps protected routes
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, isAuthenticated }) => {
  // Check if the authentication status is still being determined
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading message while the auth status is being checked
  }

  // If the user is not authenticated, redirect them to the home page ("/")
  /*if (!isAuthenticated) {
    return <Navigate to="/" replace />; // Redirect to the homepage
  }*/

  // If the user is authenticated, render the requested element (protected route)
  return element;
};

export default PrivateRoute;
