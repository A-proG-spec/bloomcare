// src/Pages/Unauthorized.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaArrowLeft, FaHome, FaUserShield } from 'react-icons/fa';
import { Button } from '../components/common/Button';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaLock className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-black font-outfit mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 text-sm mb-2 font-outfit">
          You don't have permission to access this page.
        </p>
        <p className="text-gray-400 text-xs mb-6 font-outfit">
          Requested: {from}
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-600 font-outfit flex items-center gap-2">
            <FaUserShield className="w-4 h-4 text-[#22c55e]" />
            <span>Required role: <strong className="text-black">Administrator</strong></span>
          </p>
          <p className="text-xs text-gray-400 mt-1 font-outfit">
            Contact your administrator if you need access.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(-1)} 
            fullWidth
            variant="outline"
            icon={<FaArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            fullWidth
            icon={<FaHome className="w-4 h-4" />}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};