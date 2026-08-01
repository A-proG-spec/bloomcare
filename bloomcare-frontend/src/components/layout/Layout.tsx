import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // If authenticated and trying to access root, redirect to medicines
  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/medicines" replace />;
  }

  // For all users - show navbar
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
    </div>
  );
};