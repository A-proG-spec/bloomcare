import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  requiredRoles?: string[];          // Roles that can access this route
  requiredPermissions?: string[];   // Future: Permission-based access
  fallbackPath?: string;            // Where to redirect if unauthorized
  requireVerified?: boolean;        // Require email verification
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles = [],
  fallbackPath = '/unauthorized',
  requireVerified = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking
  if (isLoading) {
    return <div>Loading...</div>; // Or use your LoadingSpinner
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification
  if (requireVerified && !user.isEmailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or fallback
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // All checks passed - render the protected content
  return <Outlet />;
};