import { Request, Response } from "express";
import User from "../models/User";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authService from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";
import { environment } from "../config/enviroment";
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  resendOTPValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../validations/authValidation";
import { logger } from "../config/logger";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerValidation.parse(req.body);
      const { fullName, email, password, phone } = validatedData;
      const image = req.file?.path || "";

      const result = await authService.register({
        fullName,
        email,
        password,
        phone: phone || "",
        image,
      });

      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      if (error.message === "User already exists with this email") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const validatedData = verifyEmailValidation.parse(req.body);
      const { email, otp } = validatedData;

      const result = await authService.verifyEmail(email, otp);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      if (error.message === "Invalid or expired OTP") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Email verification failed",
        error: error.message,
      });
    }
  }

  async resendOTP(req: Request, res: Response) {
    try {
      const validatedData = resendOTPValidation.parse(req.body);
      const { email } = validatedData;

      const result = await authService.resendOTP(email);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP",
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginValidation.parse(req.body);
      const { email, password } = validatedData;

      const result = await authService.login({
        email,
        password,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      if (error.message === "Invalid credentials") {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const result = await authService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message || "Failed to refresh token",
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, environment.JWT_REFRESH_SECRET) as any;
          await authService.logout(decoded.userId);
        } catch (error) {
          logger.info("Logout: Invalid refresh token, clearing session anyway");
        }
      }

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone || "",
            image: user.image || "",
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to get profile",
        error: error.message,
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ✅ FIX: Cast to Request to access body and file
      const validatedData = updateProfileValidation.parse((req as Request).body);
      const { fullName, phone } = validatedData;
      const image = (req as Request).file?.path || undefined;

      const updatedUser = await authService.updateProfile(user._id.toString(), {
        fullName,
        phone,
        image,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: updatedUser,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }

 async changePassword(req: AuthRequest, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validatedData = changePasswordValidation.parse(req.body);

    // Fetch the user with the password included
    const userWithPassword = await User.findById(user._id).select("+password");

    if (!userWithPassword) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      userWithPassword.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(environment.BCRYPT_SALT_ROUNDS);

    const hashedPassword = await bcrypt.hash(
      validatedData.newPassword,
      salt
    );

    userWithPassword.password = hashedPassword;

    await userWithPassword.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    logger.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
}
}

export default new AuthController();