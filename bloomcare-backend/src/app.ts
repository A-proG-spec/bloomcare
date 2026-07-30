import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import pharmacyRoutes from "./routes/pharmacyRoutes";
import orderRoutes from "./routes/orderRoutes";
import medicineRoutes from "./routes/medicineRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import adminRoutes from "./routes/adminRoutes";
import paymentRoutes from "./routes/PaymentRoute";
import aiRoutes from "./routes/aiRoutes"

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// ===== IMPORTANT: Webhook route must be BEFORE express.json() =====
// Webhook needs raw body for Stripe signature verification
app.use("/api/payments/stripe-webhook", express.raw({ type: 'application/json' }));

// ===== Then apply JSON parser for all other routes =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? (err as any).message : undefined,
  });
});

export default app;