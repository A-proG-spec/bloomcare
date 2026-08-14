import crypto from "crypto";
import emailTransporter from "../config/email";
import { environment } from "../config/enviroment";
import { logger } from "../config/logger";
import { getOtpEmailTemplate } from "../templates/emailTemplates";

class OTPService {
  generateOTP(): string {
    // Generate 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
  }

  getOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes expiry
    return expiry;
  }

  isOTPValid(otp: string, storedOtp: string, otpExpires: Date): boolean {
    const now = new Date();
    return otp === storedOtp && now < otpExpires;
  }

  async sendVerificationEmail(email: string, fullName: string, otp: string): Promise<void> {
    try {
      const html = getOtpEmailTemplate(otp, fullName);

      await emailTransporter.sendMail({
        from: `"BloomCare" <${environment.GMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email - BloomCare",
        html,
      });

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error("Failed to send verification email");
    }
  }
}

export default new OTPService();