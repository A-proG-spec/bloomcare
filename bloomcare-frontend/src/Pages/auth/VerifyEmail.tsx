import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEnvelope, FaCheck, FaArrowRight, FaSync } from 'react-icons/fa';
import { sanitizeEmail } from '../../utils/sanitizers';
import { authApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface LocationState {
  email?: string;
}

export const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Fixed: Use useMemo or initialize from location directly
  const email = React.useMemo(() => {
    const state = location.state as LocationState | null;
    const stateEmail = state?.email;
    if (stateEmail) {
      return sanitizeEmail(stateEmail) || stateEmail;
    }
    return '';
  }, [location]);

  // ✅ Fixed: Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // ✅ Validate OTP
  const validateOTP = (value: string): string | null => {
    if (!value || value.length === 0) {
      return 'Please enter the 6-digit OTP';
    }
    if (value.length !== 6) {
      return 'OTP must be exactly 6 digits';
    }
    if (!/^\d{6}$/.test(value)) {
      return 'OTP must contain only numbers';
    }
    return null;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    
    // Clear error when user types
    if (otpError) {
      setOtpError(null);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Validate OTP
    const error = validateOTP(otp);
    if (error) {
      setOtpError(error);
      toast.error(error);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApi.verifyEmail({ email, otp });
      
      if (response.data) {
        const { accessToken, refreshToken, user } = response.data;
        useAuthStore.getState().login(user, accessToken, refreshToken);
        toast.success('Email verified! Welcome to BloomCare.');
        navigate('/');
      } else {
        toast.success(response.message || 'Email verified successfully. You can now login.');
        navigate('/login');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Invalid or expired OTP.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await authApi.resendOTP({ email });
      toast.success('New OTP sent to your email.');
      setOtp('');
      setOtpError(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Failed to resend OTP.';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#22c55e] rounded-xl flex items-center justify-center mx-auto mb-4">
            <FaEnvelope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black font-outfit">Verify Email</h2>
          <p className="text-gray-500 text-sm mt-1 font-outfit">
            We've sent a 6-digit OTP to <strong className="text-black">{email}</strong>
          </p>
          {otpError && (
            <p className="text-xs text-red-500 mt-2 font-outfit">{otpError}</p>
          )}
        </div>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="OTP Code"
            placeholder="123456"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-bold"
            icon={<FaCheck className="w-4 h-4" />}
            error={otpError || undefined}
            required
          />
          
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading} 
            icon={<FaArrowRight className="w-4 h-4" />} 
            iconPosition="right"
            disabled={otp.length !== 6}
          >
            Verify Email
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-[#22c55e] hover:text-[#16a34a] font-medium flex items-center justify-center gap-2 hover:underline transition-colors disabled:opacity-50 font-outfit mx-auto"
          >
            <FaSync className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};