import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, canAccess } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login preserving the attempted route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific allowed roles if specified on the route
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
    }
  }

  // Check global capability matrix
  if (!canAccess(location.pathname)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return children;
};
