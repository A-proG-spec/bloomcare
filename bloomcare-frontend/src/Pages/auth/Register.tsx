// src/Pages/auth/Register.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCamera, FaArrowRight, FaUserMd } from 'react-icons/fa';

// ✅ Security imports
import { 
    getPasswordStrength, 
    getPasswordStrengthLabel 
} from '../../utils/validators';
import { sanitizeEmail, sanitizePhone } from '../../utils/sanitizers';

// API imports
import { authApi } from '../../api/endpoints';

// UI Components
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

// ============================================================
// ✅ ENHANCED Zod Schema with security rules
// NOTE: phone is optional (string | undefined)
// ============================================================
const registerSchema = z.object({
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must be less than 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
        .transform(val => val.trim()),
    
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .regex(/^[^\s]+$/, 'Email cannot contain spaces')
        .transform(val => val.trim().toLowerCase()),
    
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number')
        .regex(/^[^\s]+$/, 'Password cannot contain spaces')
        .transform(val => val.trim()),
    
    confirmPassword: z.string()
        .min(1, 'Please confirm your password')
        .transform(val => val.trim()),
    
    phone: z.string()
        .optional()
        .default('')
        .transform(val => val ? val.trim() : ''),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// ✅ Infer the type from the schema
type RegisterForm = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    // ✅ Fixed: Use the inferred type with explicit typing
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
        },
    });

    // Watch password for strength indicator
    // ✅ This warning is harmless - it's just a React Compiler warning
    const password = watch('password');

    // ✅ Get password strength
    const passwordStrength = getPasswordStrength(password || '');
    const strengthLabel = getPasswordStrengthLabel(passwordStrength);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a valid image (JPG, PNG, GIF, WebP)');
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // ✅ Fixed: Explicitly type the submit handler
    const onSubmit = handleSubmit(async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            // ✅ Sanitize inputs before sending to API
            const sanitizedEmail = sanitizeEmail(data.email) || data.email;
            const sanitizedPhone = data.phone ? sanitizePhone(data.phone) : '';
            
            const response = await authApi.register({
                fullName: data.fullName,
                email: sanitizedEmail,
                password: data.password,
                phone: sanitizedPhone || '',
                image: selectedFile,
            });
            
            toast.success(response.message || 'Registration successful! Please verify your email.');
            navigate('/verify-email', { state: { email: sanitizedEmail } });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    });

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
                
                <form onSubmit={onSubmit} className="space-y-4">
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
                        required
                        autoComplete="name"
                    />
                    
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        icon={<FaEnvelope className="w-4 h-4" />}
                        {...register('email')}
                        error={errors.email?.message}
                        required
                        autoComplete="email"
                    />
                    
                    {/* ✅ Password with strength indicator */}
                    <div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={<FaLock className="w-4 h-4" />}
                            {...register('password')}
                            error={errors.password?.message}
                            required
                            autoComplete="new-password"
                        />
                        
                        {/* ✅ Password strength indicator */}
                        {password && password.length > 0 && (
                            <div className="mt-2">
                                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${strengthLabel.bgColor} transition-all duration-300`} 
                                        style={{ width: `${(passwordStrength / 4) * 100}%` }} 
                                    />
                                </div>
                                <span className={`text-xs ${strengthLabel.color} font-outfit mt-0.5 block`}>
                                    Password strength: {strengthLabel.label}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<FaLock className="w-4 h-4" />}
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        required
                        autoComplete="new-password"
                    />
                    
                    <Input
                        label="Phone (optional)"
                        placeholder="+1234567890"
                        icon={<FaPhone className="w-4 h-4" />}
                        {...register('phone')}
                        error={errors.phone?.message}
                        autoComplete="tel"
                    />
                    
                    <Button 
                        type="submit" 
                        fullWidth 
                        isLoading={isLoading} 
                        icon={<FaArrowRight className="w-4 h-4" />} 
                        iconPosition="right"
                    >
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