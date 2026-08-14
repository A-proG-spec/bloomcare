// src/Pages/profile/ChangePassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints/auth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      
      // ✅ Navigate back to profile after success
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#22c55e] transition-colors mb-6 font-outfit"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-black font-outfit">Change Password</h1>
          <p className="text-gray-500 text-sm mt-1 font-outfit">
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            icon={<FaLock className="w-4 h-4" />}
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
            showPasswordToggle
            autoComplete="current-password"
          />
          
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password (min 6 characters)"
            icon={<FaLock className="w-4 h-4" />}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            showPasswordToggle
            autoComplete="new-password"
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            icon={<FaCheckCircle className="w-4 h-4" />}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            showPasswordToggle
            autoComplete="new-password"
          />

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            icon={<FaLock className="w-4 h-4" />}
          >
            Change Password
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 font-outfit">
            Password must be at least 6 characters and contain a letter and a number
          </p>
        </div>
      </div>
    </div>
  );
};