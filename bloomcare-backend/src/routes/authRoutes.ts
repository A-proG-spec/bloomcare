import { Router } from "express";
import authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { registerValidation, loginValidation } from "../validations/authValidation";

const router = Router();

// Public routes with file upload for register
router.post(
  "/register",
  upload.single("image"),
  validate(registerValidation),
  authController.register
);

router.post("/login", validate(loginValidation), authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-otp", authController.resendOTP);
router.post("/refresh-token", authController.refreshToken);

// ✅ FIX: Logout does NOT require authentication
router.post("/logout", authController.logout);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.put(
  "/profile",
  authenticate,
  upload.single("image"),
  authController.updateProfile
);
router.put("/change-password", authenticate, authController.changePassword);

export default router;