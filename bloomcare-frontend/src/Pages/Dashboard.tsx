// bloomcare-frontend/src/Pages/Dashboard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  // Redirect to medicines by default
  return <Navigate to="/dashboard/medicines" replace />;
};