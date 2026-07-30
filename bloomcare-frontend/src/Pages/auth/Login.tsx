import React, { useState } from 'react';
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

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(data);
            if (response.requiresVerification) {
                toast.success('Please verify your email first. A new OTP has been sent.');
                navigate('/verify-email', { state: { email: data.email } });
                return;
            }
            if (response.data) {
                const { accessToken, refreshToken, user } = response.data;
                login(user, accessToken, refreshToken);
                toast.success('Login successful!');
                navigate('/');
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
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
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        icon={<FaEnvelope className="w-4 h-4" />}
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<FaLock className="w-4 h-4" />}
                        {...register('password')}
                        error={errors.password?.message}
                    />
                    <Button type="submit" fullWidth isLoading={isLoading} icon={<FaArrowRight className="w-4 h-4" />} iconPosition="right">
                        Login
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