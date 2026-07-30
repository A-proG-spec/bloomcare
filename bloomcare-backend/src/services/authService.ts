import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import otpService from "./otpService";
import { environment } from "../config/enviroment";
import { logger } from "../config/logger";

export interface IRegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    phone?: string;
    image?: string;
    isEmailVerified: boolean;
  };
}

export interface IAuthResponse {
  message: string;
  requiresVerification?: boolean;
  data?: ITokenResponse;
}

export interface IUpdateProfileData {
  fullName?: string;
  phone?: string;
  image?: string;
}

class AuthService {
  async register(userData: IRegisterData): Promise<IAuthResponse> {
    const { fullName, email, password, phone, image } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new Error("User already exists with this email");
      }
      await User.deleteOne({ email });
    }

    const salt = await bcrypt.genSalt(environment.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = otpService.generateOTP();
    const otpExpires = otpService.getOTPExpiry();

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone: phone || "",
      image: image || "",
      otp,
      otpExpires,
      isEmailVerified: false,
    });

    await otpService.sendVerificationEmail(email, fullName, otp);

    logger.info(`User registered: ${email}`);

    return {
      message: "Registration successful! Please verify your email with the OTP sent to your inbox.",
      requiresVerification: true,
    };
  }

  async verifyEmail(email: string, otp: string): Promise<IAuthResponse> {
    const user = await User.findOne({ email }).select("+otp +otpExpires");
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    if (!user.otp || !user.otpExpires) {
      throw new Error("OTP not found. Please request a new one.");
    }

    const isValid = otpService.isOTPValid(otp, user.otp, user.otpExpires);
    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const tokens = await this.generateTokens(user);

    logger.info(`Email verified for: ${email}`);

    return {
      message: "Email verified successfully!",
      data: {
        ...tokens,
        user: this.formatUser(user),
      },
    };
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    const otp = otpService.generateOTP();
    const otpExpires = otpService.getOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await otpService.sendVerificationEmail(email, user.fullName, otp);

    logger.info(`New OTP sent to: ${email}`);

    return {
      message: "New OTP has been sent to your email",
    };
  }

  async login(loginData: ILoginData): Promise<IAuthResponse> {
    const { email, password } = loginData;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isEmailVerified) {
      const otp = otpService.generateOTP();
      const otpExpires = otpService.getOTPExpiry();

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      await otpService.sendVerificationEmail(email, user.fullName, otp);

      return {
        message: "Please verify your email first. A new OTP has been sent.",
        requiresVerification: true,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const tokens = await this.generateTokens(user);

    logger.info(`User logged in: ${email}`);

    return {
      message: "Login successful",
      data: {
        ...tokens,
        user: this.formatUser(user),
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, environment.JWT_REFRESH_SECRET) as any;

      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user) {
        throw new Error("User not found");
      }

      if (user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token");
      }

      const tokens = await this.generateTokens(user);

      logger.info(`Tokens refreshed for user: ${user.email}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error: any) {
      logger.error("Refresh token error:", error);
      throw new Error("Invalid or expired refresh token");
    }
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info(`User logged out: ${userId}`);
  }

  async updateProfile(userId: string, data: IUpdateProfileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (data.fullName) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.image) user.image = data.image;

    await user.save();

    logger.info(`Profile updated for user ${userId}`);
    return this.formatUser(user);
  }

  private async generateTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      environment.JWT_ACCESS_SECRET,
      { expiresIn: environment.JWT_ACCESS_EXPIRE } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      environment.JWT_REFRESH_SECRET,
      { expiresIn: environment.JWT_REFRESH_EXPIRE } as jwt.SignOptions
    );

    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }

  private formatUser(user: IUser) {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      image: user.image || "",
      isEmailVerified: user.isEmailVerified,
    };
  }
}

export default new AuthService();