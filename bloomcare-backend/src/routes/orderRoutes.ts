import { Router } from "express";
import orderController from "../controllers/orderController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from "../validations/orderValidation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/my-orders", orderController.getUserOrders);
router.get("/:id", orderController.getOrderDetails);
router.post("/:id/cancel", validate(cancelOrderSchema), orderController.cancelOrder);

// Pharmacy owner routes
router.get(
  "/pharmacy/:pharmacyId",
  authorize("pharmacy_owner", "admin"),
  orderController.getPharmacyOrders
);

// Admin routes
router.put(
  "/:id/status",
  authorize("pharmacy_owner", "admin"),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.get(
  "/admin/stats",
  authorize("admin"),
  orderController.getOrderStats
);

export default router;