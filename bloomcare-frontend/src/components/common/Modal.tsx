import React from 'react';
import { Button } from './Button';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmVariant?: 'primary' | 'accent' | 'outline';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  confirmVariant = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 animate-slideUp border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black font-outfit">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">{children}</div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              fullWidth
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};