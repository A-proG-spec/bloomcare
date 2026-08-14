// src/routes/cartRoutes.ts
import { Router } from "express";
import cartController from "../controllers/cartController";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from "../validations/cartValidation";

const router = Router();

// ============================================================
// ✅ GUEST + AUTHENTICATED ROUTES (optionalAuthenticate)
// ============================================================

// ✅ Get cart (works for both guest and authenticated users)
router.get("/", optionalAuthenticate, cartController.getCart);

// ✅ Get cart count (for badge)
router.get("/count", optionalAuthenticate, cartController.getCartCount);

// ✅ Add item to cart
router.post(
  "/",
  optionalAuthenticate,
  validate(addToCartSchema),
  cartController.addItem
);

// ✅ Update item quantity
router.put(
  "/:medicineId/:pharmacyId",
  optionalAuthenticate,
  validate(updateCartItemSchema),
  cartController.updateItem
);

// ✅ Remove item
router.delete(
  "/:medicineId/:pharmacyId",
  optionalAuthenticate,
  cartController.removeItem
);

// ✅ Clear cart
router.delete("/", optionalAuthenticate, cartController.clearCart);

// ✅ Validate cart (for checkout)
router.get("/validate", optionalAuthenticate, cartController.validateCart);

router.post(
  "/merge",
  authenticate,
  validate(mergeCartSchema),
  cartController.mergeGuestCart
);

export default router;