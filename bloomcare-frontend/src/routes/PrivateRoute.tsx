// src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface PrivateRouteProps {
  /** Roles that are allowed to access this route */
  requiredRoles?: string[];
  /** Where to redirect if unauthorized (default: /unauthorized) */
  fallbackPath?: string;
  /** Whether to require email verification (default: true) */
  requireVerified?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  requiredRoles = [],
  fallbackPath = '/unauthorized',
  requireVerified = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // ✅ Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // ❌ Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ Email not verified
  if (requireVerified && !user.isEmailVerified) {
    return <Navigate to="/verify-email" state={{ from: location, email: user.email }} replace />;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }
  }

  // ✅ All checks passed - render the protected content
  return <Outlet />;
};