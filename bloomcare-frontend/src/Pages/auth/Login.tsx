import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FaEnvelope, FaLock, FaArrowRight, FaUserMd } from 'react-icons/fa';
import { sanitizeEmail } from '../../utils/sanitizers';

// ✅ Enhanced validation
const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .regex(/^[^\s]+$/, 'Email cannot contain spaces')
        .transform(val => val.trim().toLowerCase()),
    password: z.string()
        .min(1, 'Password is required')
        .transform(val => val.trim()),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    // ✅ Use sessionStorage to persist login attempts across refreshes
    const [loginAttempts, setLoginAttempts] = useState(() => {
        const saved = sessionStorage.getItem('loginAttempts');
        return saved ? parseInt(saved, 10) : 0;
    });
    
    const [isLocked, setIsLocked] = useState(() => {
        const locked = sessionStorage.getItem('isLocked');
        return locked === 'true';
    });

    const [lockTimer, setLockTimer] = useState<number>(() => {
        const timer = sessionStorage.getItem('lockTimer');
        return timer ? parseInt(timer, 10) : 0;
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // ✅ Save attempts to sessionStorage when they change
    useEffect(() => {
        sessionStorage.setItem('loginAttempts', loginAttempts.toString());
    }, [loginAttempts]);

    // ✅ Save lock status to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('isLocked', isLocked.toString());
    }, [isLocked]);

    // ✅ Countdown timer for lock
    useEffect(() => {
        if (isLocked && lockTimer > 0) {
            const interval = setInterval(() => {
                setLockTimer((prev) => {
                    const newTime = prev - 1;
                    sessionStorage.setItem('lockTimer', newTime.toString());
                    if (newTime <= 0) {
                        setIsLocked(false);
                        setLoginAttempts(0);
                        sessionStorage.removeItem('isLocked');
                        sessionStorage.removeItem('lockTimer');
                        sessionStorage.removeItem('loginAttempts');
                        clearInterval(interval);
                    }
                    return newTime;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isLocked, lockTimer]);

    // ✅ FIX: Proper error handling - NO page reload
    const onSubmit = async (data: LoginForm) => {
        // ✅ Prevent any default behavior
        // The react-hook-form handleSubmit already prevents default
        
        // ✅ Check if locked first
        if (isLocked) {
            const minutes = Math.floor(lockTimer / 60);
            const seconds = lockTimer % 60;
            toast.error(`Too many failed attempts. Please wait ${minutes}m ${seconds}s.`);
            return;
        }

        // ✅ Set loading state
        setIsLoading(true);

        try {
            const sanitizedEmail = sanitizeEmail(data.email) || data.email;
            
            const response = await authApi.login({
                email: sanitizedEmail,
                password: data.password,
            });
            
            // ✅ Handle verification required
            if (response.requiresVerification) {
                toast.success('Please verify your email first. A new OTP has been sent.');
                navigate('/verify-email', { state: { email: sanitizedEmail } });
                return;
            }
            
            // ✅ Handle successful login
            if (response.data) {
                const { accessToken, refreshToken, user } = response.data;
                login(user, accessToken, refreshToken);
                toast.success('Login successful!');
                
                // ✅ Reset attempts on success
                setLoginAttempts(0);
                sessionStorage.removeItem('loginAttempts');
                sessionStorage.removeItem('isLocked');
                sessionStorage.removeItem('lockTimer');
                
                navigate('/medicines');
            }
        } catch (error: unknown) {
            // ✅ CRITICAL FIX: Properly handle the error WITHOUT page reload
            const err = error as { 
                response?: { 
                    data?: { message?: string } 
                } 
            };
            
            const message = err.response?.data?.message || 'Invalid email or password. Please try again.';
            
            // ✅ Increment attempts
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            
            if (newAttempts >= 5) {
                setIsLocked(true);
                setLockTimer(300);
                sessionStorage.setItem('isLocked', 'true');
                sessionStorage.setItem('lockTimer', '300');
                toast.error('Too many failed attempts. Account locked for 5 minutes.');
            } else {
                toast.error(`${message} (${5 - newAttempts} attempts remaining)`);
            }
            
            // ✅ DO NOT navigate or reload
            // ✅ Just show the error message
        } finally {
            // ✅ Always reset loading state
            setIsLoading(false);
        }
    };

    // ✅ Show lock message
    const getLockMessage = () => {
        if (isLocked) {
            const minutes = Math.floor(lockTimer / 60);
            const seconds = lockTimer % 60;
            return `Account locked. Try again in ${minutes}m ${seconds}s`;
        }
        if (loginAttempts > 0 && loginAttempts < 5) {
            return `${5 - loginAttempts} attempts remaining`;
        }
        return '';
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#22c55e] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FaUserMd className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-black font-outfit">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-1 font-outfit">Sign in to your BloomCare account</p>
                    
                    {/* ✅ Show attempt/lock message */}
                    {(loginAttempts > 0 || isLocked) && (
                        <p className={`text-xs mt-2 font-outfit ${
                            isLocked ? 'text-red-500' : 'text-orange-500'
                        }`}>
                            {getLockMessage()}
                        </p>
                    )}
                </div>
                
                {/* ✅ FIX: handleSubmit prevents default */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        icon={<FaEnvelope className="w-4 h-4" />}
                        {...register('email')}
                        error={errors.email?.message}
                        required
                        autoComplete="email"
                        disabled={isLocked}
                    />
                    
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<FaLock className="w-4 h-4" />}
                        {...register('password')}
                        error={errors.password?.message}
                        required
                        showPasswordToggle
                        autoComplete="current-password"
                        disabled={isLocked}
                    />
                    
                    <Button 
                        type="submit" 
                        fullWidth 
                        isLoading={isLoading} 
                        disabled={isLocked}
                        icon={<FaArrowRight className="w-4 h-4" />} 
                        iconPosition="right"
                    >
                        {isLocked ? 'Account Locked' : 'Login'}
                    </Button>
                </form>
                
                <p className="mt-6 text-sm text-center text-gray-600 font-outfit">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#22c55e] hover:text-[#16a34a] font-semibold hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};