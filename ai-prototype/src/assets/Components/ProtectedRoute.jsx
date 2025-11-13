import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("user => ", user);

  // If no user, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
