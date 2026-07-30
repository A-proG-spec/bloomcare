import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const location = useLocation();
  // Pages that should take full width (no max-width/padding)
  const fullWidthPages = ['/', '/pharmacies'];
  const isFullWidth = fullWidthPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className={`flex-grow w-full ${isFullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
    </div>
  );
};