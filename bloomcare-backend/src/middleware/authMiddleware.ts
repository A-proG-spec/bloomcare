import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { environment } from "../config/enviroment";

export interface AuthRequest extends Request {
  user?: IUser;
  params: Record<string, string>;
  body: any;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  file?: any;
  files?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization as string;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify access token
    const decoded = jwt.verify(token, environment.JWT_ACCESS_SECRET) as any;

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password -refreshToken -otp -otpExpires");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before accessing this resource.",
        requiresVerification: true,
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired. Please refresh your token.",
        tokenExpired: true,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not allowed.`,
      });
    }

    next();
  };
};

// ============================================================
// ✅ NEW: Optional Authentication for Cart Routes
// ============================================================

export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization as string;

    // No token = guest user - just continue
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      environment.JWT_ACCESS_SECRET
    ) as any;

    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken -otp -otpExpires"
    );

    // Invalid user/token → treat as guest
    if (!user) {
      return next();
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before accessing this resource.",
        requiresVerification: true,
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    // Expired/invalid token → don't crash guest cart
    // Just treat as guest
    return next();
  }
};