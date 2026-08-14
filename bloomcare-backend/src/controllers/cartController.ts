// src/controllers/cartController.ts
import { Request, Response } from "express";
import { z } from "zod";
import cartService from "../services/cartService";
import { AuthRequest } from "../middleware/authMiddleware"; // ✅ Fixed: Remove 'type'
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from "../validations/cartValidation";
import { v4 as uuidv4 } from "uuid";

class CartController {
  // ============================================================
  // GET CART
  // ============================================================

  async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = req.headers["x-session-id"] as string;

      const cart = await cartService.getOrCreateCart(userId, sessionId);

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to get cart",
        error: error.message,
      });
    }
  }

  // ============================================================
  // ADD ITEM
  // ============================================================

  async addItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = (req.headers["x-session-id"] as string) || uuidv4();

      const validatedData = addToCartSchema.parse(req.body);

      const cart = await cartService.addItem(
        userId,
        sessionId,
        validatedData
      );

      return res.status(200).json({
        success: true,
        message: "Item added to cart",
        data: cart,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to add item to cart",
      });
    }
  }

  // ============================================================
  // UPDATE ITEM QUANTITY
  // ============================================================

  async updateItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = req.headers["x-session-id"] as string;

      const { medicineId, pharmacyId } = req.params;
      const validatedData = updateCartItemSchema.parse(req.body);

      const cart = await cartService.updateItemQuantity(
        userId,
        sessionId,
        medicineId,
        pharmacyId,
        validatedData.quantity
      );

      return res.status(200).json({
        success: true,
        message: "Cart updated",
        data: cart,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update cart",
      });
    }
  }

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  async removeItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = req.headers["x-session-id"] as string;

      const { medicineId, pharmacyId } = req.params;

      const cart = await cartService.removeItem(
        userId,
        sessionId,
        medicineId,
        pharmacyId
      );

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: cart,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to remove item from cart",
      });
    }
  }

  // ============================================================
  // CLEAR CART
  // ============================================================

  async clearCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = req.headers["x-session-id"] as string;

      // ✅ Return early if neither userId nor sessionId exists
      if (!userId && !sessionId) {
        return res.status(200).json({
          success: true,
          message: "No active cart session to clear",
        });
      }

      await cartService.clearCart(userId, sessionId);

      return res.status(200).json({
        success: true,
        message: "Cart cleared",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to clear cart",
        error: error.message,
      });
    }
  }

  // ============================================================
  // MERGE GUEST CART (on login)
  // ============================================================

  async mergeGuestCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      const validatedData = mergeCartSchema.parse(req.body);

      const cart = await cartService.mergeGuestCart(
        userId,
        sessionId,
        validatedData.items
      );

      return res.status(200).json({
        success: true,
        message: "Cart merged successfully",
        data: cart,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to merge cart",
        error: error.message,
      });
    }
  }

  // ============================================================
  // VALIDATE CART
  // ============================================================

  async validateCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = req.headers["x-session-id"] as string;

      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const validation = await cartService.validateCartForCheckout(cart);

      return res.status(200).json({
        success: true,
        data: validation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate cart",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CART COUNT (for badge)
  // ============================================================

  async getCartCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const sessionId = req.headers["x-session-id"] as string;

      const cart = await cartService.getOrCreateCart(userId, sessionId);

      return res.status(200).json({
        success: true,
        data: {
          count: cart.totalItems || 0,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to get cart count",
        error: error.message,
      });
    }
  }
}

export default new CartController();