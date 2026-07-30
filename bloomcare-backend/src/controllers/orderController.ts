import { Request, Response } from "express";
import { z } from "zod";
import orderService from "../services/orderService";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from "../validations/orderValidation";

class OrderController {
  /**
   * Create new order
   * POST /api/orders
   */
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = createOrderSchema.parse((req as Request).body);
      const { pharmacyId, items, paymentMethod } = validatedData;

      const order = await orderService.createOrder({
        userId: user._id.toString(),
        pharmacyId,
        items,
        paymentMethod: paymentMethod || 'cod',
      });

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
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
        message: error.message || "Failed to create order",
      });
    }
  }

  /**
   * Get user's orders
   * GET /api/orders/my-orders
   */
  async getUserOrders(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access query
      const query = (req as Request).query;
      const { status, page, limit } = query;

      const result = await orderService.getUserOrders(
        user._id.toString(),
        status as string,
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }

  /**
   * Get pharmacy orders (pharmacy owner)
   * GET /api/orders/pharmacy/:pharmacyId
   */
  async getPharmacyOrders(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access query
      const query = (req as Request).query;
      const { pharmacyId, status, page, limit } = query;

      if (!pharmacyId) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID is required",
        });
      }

      const result = await orderService.getPharmacyOrders(
        pharmacyId as string,
        status as string,
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pharmacy orders",
        error: error.message,
      });
    }
  }

  /**
   * Get order details
   * GET /api/orders/:id
   */
  async getOrderDetails(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const id = (req as Request).params.id as string;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const order = await orderService.getOrderDetails(
        id,
        user._id.toString(),
        user.role
      );

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Order not found",
      });
    }
  }

  /**
   * Update order status (admin/pharmacy owner)
   * PUT /api/orders/:id/status
   */
  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params and body
      const id = (req as Request).params.id as string;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const validatedData = updateOrderStatusSchema.parse((req as Request).body);

      const order = await orderService.updateOrderStatus({
        orderId: id,
        status: validatedData.status,
        note: validatedData.note,
        userId: user._id.toString(),
        userRole: user.role,
      });

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${validatedData.status}`,
        data: order,
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
        message: error.message || "Failed to update order status",
      });
    }
  }

  /**
   * Cancel order (user)
   * POST /api/orders/:id/cancel
   */
  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params and body
      const id = (req as Request).params.id as string;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const validatedData = cancelOrderSchema.parse((req as Request).body);

      const order = await orderService.cancelOrder({
        orderId: id,
        reason: validatedData.reason,
        userId: user._id.toString(),
      });

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
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
        message: error.message || "Failed to cancel order",
      });
    }
  }

  /**
   * Get order statistics (admin only)
   * GET /api/orders/admin/stats
   */
  async getOrderStats(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      const stats = await orderService.getOrderStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch order statistics",
        error: error.message,
      });
    }
  }
}

export default new OrderController();