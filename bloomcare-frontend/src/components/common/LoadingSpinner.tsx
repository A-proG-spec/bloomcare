import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#d1f843] border-t-[#22c55e]"></div>
    </div>
  );
};