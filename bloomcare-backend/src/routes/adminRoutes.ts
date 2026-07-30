import { Router } from "express";
import adminController from "../controllers/adminController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
  getUsersQuerySchema,
  updateUserRoleSchema,
  getOrdersQuerySchema,
  getAnalyticsQuerySchema,
} from "../validations/adminValidation";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// ============ DASHBOARD ============
router.get("/dashboard", adminController.getDashboardStats);

// ============ USER MANAGEMENT ============
// ✅ Remove validation middleware for GET routes that have query params
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

// ============ PHARMACY MANAGEMENT ============
router.get("/pharmacies", adminController.getAllPharmacies);
router.put("/pharmacies/:id/toggle-status", adminController.togglePharmacyStatus);

// ============ PHARMACY APPLICATIONS ============
router.get("/applications/pending", adminController.getPendingApplications);

// ============ ORDER MANAGEMENT ============
// ✅ Remove validation middleware for GET route
router.get("/orders", adminController.getAllOrders);

// ============ ANALYTICS ============
// ✅ Remove validation middleware for GET routes
router.get("/analytics", adminController.getAnalytics);
router.get("/analytics/revenue", adminController.getRevenueAnalytics);
router.get("/analytics/top-pharmacies", adminController.getTopPharmacies);
router.get("/analytics/top-medicines", adminController.getTopMedicines);

export default router;