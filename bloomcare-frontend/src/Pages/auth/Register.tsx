import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/endpoints';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCamera, FaArrowRight, FaUserMd, FaCheck } from 'react-icons/fa';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            const response = await authApi.register({
                ...data,
                image: selectedFile,
            });
            toast.success(response.message || 'Registration successful! Please verify your email.');
            navigate('/verify-email', { state: { email: data.email } });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#22c55e] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FaUserMd className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-black font-outfit">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-1 font-outfit">Join BloomCare today</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Profile preview"
                                        className="w-16 h-16 rounded-xl object-cover border-2 border-[#d1f843]"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                    <FaCamera className="w-6 h-6" />
                                </div>
                            )}
                            <label className="absolute -bottom-1 -right-1 bg-[#22c55e] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#16a34a] transition-colors">
                                <FaCamera className="w-3 h-3" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 font-outfit">Add a profile photo (optional)</p>
                    </div>

                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        icon={<FaUser className="w-4 h-4" />}
                        {...register('fullName')}
                        error={errors.fullName?.message}
                    />
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
                    <Input
                        label="Phone (optional)"
                        placeholder="+1234567890"
                        icon={<FaPhone className="w-4 h-4" />}
                        {...register('phone')}
                        error={errors.phone?.message}
                    />
                    <Button type="submit" fullWidth isLoading={isLoading} icon={<FaArrowRight className="w-4 h-4" />} iconPosition="right">
                        Register
                    </Button>
                </form>
                <p className="mt-6 text-sm text-center text-gray-600 font-outfit">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#22c55e] hover:text-[#16a34a] font-semibold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};