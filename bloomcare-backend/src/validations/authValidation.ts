import { z } from "zod";

export const registerValidation = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .trim(),

  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain at least one letter and one number"),

  phone: z.string()
    .optional()
    .default(""),
});

export const loginValidation = z.object({
  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, "Password is required"),
});

export const verifyEmailValidation = z.object({
  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  otp: z.string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export const resendOTPValidation = z.object({
  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
});

export const updateProfileValidation = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .optional(),

  phone: z.string()
    .optional(),

  image: z.string()
    .url("Please provide a valid URL")
    .optional(),
});

export const changePasswordValidation = z.object({
  currentPassword: z.string()
    .min(1, "Current password is required"),

  newPassword: z.string()
    .min(6, "New password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain at least one letter and one number"),
});

export type RegisterInput = z.infer<typeof registerValidation>;
export type LoginInput = z.infer<typeof loginValidation>;
export type VerifyEmailInput = z.infer<typeof verifyEmailValidation>;
export type ResendOTPInput = z.infer<typeof resendOTPValidation>;
export type UpdateProfileInput = z.infer<typeof updateProfileValidation>;
export type ChangePasswordInput = z.infer<typeof changePasswordValidation>;