import dotenv from "dotenv";
dotenv.config();

export const environment = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || "15m",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "7d",

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),

  // Gmail SMTP
GMAIL_USER: process.env.GMAIL_USER || "",
GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || "",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || "usd",
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || "http://localhost:5173/orders",
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || "http://localhost:5173/cart",
  STRIPE_WEBHOOK_URL: process.env.STRIPE_WEBHOOK_URL || "http://localhost:5000/api/payments/stripe-webhook",

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
};