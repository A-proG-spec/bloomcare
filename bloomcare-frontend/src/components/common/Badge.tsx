import React from 'react';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    accent: 'bg-[#d1f843] text-black border border-[#d1f843] font-semibold',
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  };

  const variantIcons = {
    success: <FaCheck className="w-3 h-3" />,
    warning: <FaExclamationTriangle className="w-3 h-3" />,
    danger: <FaTimes className="w-3 h-3" />,
    info: <FaInfoCircle className="w-3 h-3" />,
    accent: null,
    default: null,
  };

  const displayIcon = icon || variantIcons[variant];

  return (
    <span className={`rounded-xl inline-flex items-center gap-1.5 font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {displayIcon}
      {children}
    </span>
  );
};