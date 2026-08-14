/**
 * Modern BloomCare Email Verification Template
 * Designed to match frontend theme (#22c55e primary brand green)
 */
export const getOtpEmailTemplate = (otp: string, fullName: string): string => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #1e293b;
        }
        .wrapper {
          width: 100%;
          background-color: #f8fafc;
          padding: 40px 0;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #ffffff;
          padding: 32px 32px 16px 32px;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          text-decoration: none;
        }
        .brand-icon {
          width: 32px;
          height: 32px;
          background-color: #22c55e;
          border-radius: 50%;
          display: inline-block;
          vertical-align: middle;
        }
        .content {
          padding: 32px;
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 12px;
        }
        .text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin: 0 0 20px 0;
        }
        .otp-card {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #166534;
          margin-bottom: 8px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #15803d;
          letter-spacing: 8px;
          margin: 0;
          font-family: 'Courier New', Courier, monospace;
        }
        .badge-timer {
          display: inline-block;
          background-color: #e2e8f0;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-top: 12px;
        }
        .footer {
          padding: 24px 32px;
          background-color: #f8fafc;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="brand-logo">
              <span class="brand-icon"></span> BloomCare
            </div>
          </div>
          <div class="content">
            <h2 class="title">Verify your email address</h2>
            <p class="text">Hello <strong>${fullName}</strong>,</p>
            <p class="text">Thank you for joining BloomCare! Please use the verification code below to complete your registration:</p>
            
            <div class="otp-card">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div class="badge-timer">Expires in 10 minutes</div>
            </div>

            <p class="text" style="font-size: 13px; color: #64748b;">If you didn't create a BloomCare account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} BloomCare Inc. All rights reserved.</p>
            <p style="margin: 4px 0 0 0;">Automated notification • Please do not reply directly to this message.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Modern BloomCare Password Reset Template
 */
export const getPasswordResetEmailTemplate = (otp: string, fullName: string): string => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #1e293b;
        }
        .wrapper {
          width: 100%;
          background-color: #f8fafc;
          padding: 40px 0;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #ffffff;
          padding: 32px 32px 16px 32px;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          text-decoration: none;
        }
        .brand-icon {
          width: 32px;
          height: 32px;
          background-color: #ef4444;
          border-radius: 50%;
          display: inline-block;
          vertical-align: middle;
        }
        .content {
          padding: 32px;
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 12px;
        }
        .text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin: 0 0 20px 0;
        }
        .otp-card {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #991b1b;
          margin-bottom: 8px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #dc2626;
          letter-spacing: 8px;
          margin: 0;
          font-family: 'Courier New', Courier, monospace;
        }
        .badge-timer {
          display: inline-block;
          background-color: #fee2e2;
          color: #991b1b;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-top: 12px;
        }
        .footer {
          padding: 24px 32px;
          background-color: #f8fafc;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="brand-logo">
              <span class="brand-icon"></span> BloomCare
            </div>
          </div>
          <div class="content">
            <h2 class="title">Password Reset Request</h2>
            <p class="text">Hello <strong>${fullName}</strong>,</p>
            <p class="text">We received a request to reset your BloomCare account password. Use the verification code below to reset it:</p>
            
            <div class="otp-card">
              <div class="otp-label">Password Reset Code</div>
              <div class="otp-code">${otp}</div>
              <div class="badge-timer">Expires in 10 minutes</div>
            </div>

            <p class="text" style="font-size: 13px; color: #64748b;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} BloomCare Inc. All rights reserved.</p>
            <p style="margin: 4px 0 0 0;">Automated notification • Please do not reply directly to this message.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};