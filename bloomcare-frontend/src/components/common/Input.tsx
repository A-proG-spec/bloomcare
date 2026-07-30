import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({ 
    label, 
    error, 
    className = '', 
    id, 
    icon,
    iconPosition = 'left',
    ...props 
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-black mb-1.5 font-outfit">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && iconPosition === 'left' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 font-outfit ${
                        icon && iconPosition === 'left' ? 'pl-10' : ''
                    } ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
            </div>
            {error && <p className="mt-1.5 text-sm text-red-500 font-outfit">{error}</p>}
        </div>
    );
};