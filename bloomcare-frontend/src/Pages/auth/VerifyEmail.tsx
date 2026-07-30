import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { FaEnvelope, FaCheck, FaArrowRight, FaSync } from 'react-icons/fa';

// ✅ ADDED: Type for location state
interface LocationState {
  email?: string;
}

export const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIXED: Use ref to prevent double execution and setState in effect warning
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const state = location.state as LocationState | null;
    const stateEmail = state?.email;

    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP.');
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
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="OTP Code"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-bold"
            icon={<FaCheck className="w-4 h-4" />}
          />
          <Button type="submit" fullWidth isLoading={isLoading} icon={<FaArrowRight className="w-4 h-4" />} iconPosition="right">
            Verify Email
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-[#22c55e] hover:text-[#16a34a] font-medium flex items-center justify-center gap-2 hover:underline transition-colors disabled:opacity-50 font-outfit"
          >
            <FaSync className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};