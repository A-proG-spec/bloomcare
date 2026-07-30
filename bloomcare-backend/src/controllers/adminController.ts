import { Request, Response } from "express";
import { z } from "zod";
import adminService from "../services/adminService";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getUsersQuerySchema,
  updateUserRoleSchema,
  getOrdersQuerySchema,
  getAnalyticsQuerySchema,
} from "../validations/adminValidation";

class AdminController {
  // ============ DASHBOARD ============

  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      const stats = await adminService.getDashboardStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
    }
  }

  // ============ USER MANAGEMENT ============

  async getUsers(req: Request, res: Response) {
    try {
      // ✅ Manually parse query params with defaults
      const search = req.query.search as string || undefined;
      const role = req.query.role as string || undefined;
      const isEmailVerified = req.query.isEmailVerified === 'true' ? true : 
                              req.query.isEmailVerified === 'false' ? false : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getUsers(
        search,
        role,
        isEmailVerified,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result,
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
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id as string;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await adminService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "User not found",
      });
    }
  }

  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const admin = req.user;
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      const userId = (req as Request).params.id as string;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const validatedData = updateUserRoleSchema.parse((req as Request).body);

      if (userId === admin._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot change your own role",
        });
      }

      const user = await adminService.updateUserRole(userId, validatedData.role);

      return res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: user,
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
        message: error.message || "Failed to update user role",
      });
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const admin = req.user;
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      const userId = (req as Request).params.id as string;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      if (userId === admin._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      const result = await adminService.deleteUser(userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }

  // ============ PHARMACY MANAGEMENT ============

  async getAllPharmacies(req: Request, res: Response) {
    try {
      // ✅ Manually parse query params
      const search = req.query.search as string || undefined;
      const isActive = req.query.isActive === 'true' ? true : 
                       req.query.isActive === 'false' ? false : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getAllPharmacies(
        search,
        isActive,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pharmacies",
        error: error.message,
      });
    }
  }

  async togglePharmacyStatus(req: Request, res: Response) {
    try {
      const pharmacyId = req.params.id as string;
      if (!pharmacyId) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID is required",
        });
      }

      const pharmacy = await adminService.togglePharmacyStatus(pharmacyId);

      return res.status(200).json({
        success: true,
        message: `Pharmacy ${pharmacy.isActive ? "activated" : "deactivated"} successfully`,
        data: pharmacy,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Failed to toggle pharmacy status",
      });
    }
  }

  // ============ PHARMACY APPLICATIONS ============

  async getPendingApplications(req: Request, res: Response) {
    try {
      // ✅ Manually parse query params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getPendingApplications(page, limit);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pending applications",
        error: error.message,
      });
    }
  }

  // ============ ORDER MANAGEMENT ============

  async getAllOrders(req: Request, res: Response) {
    try {
      // ✅ Manually parse query params
      const status = req.query.status as string || undefined;
      const startDate = req.query.startDate as string || undefined;
      const endDate = req.query.endDate as string || undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getAllOrders(
        status,
        startDate,
        endDate,
        page,
        limit
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

  // ============ ANALYTICS ============

  async getAnalytics(req: Request, res: Response) {
    try {
      // ✅ Manually parse query params
      const period = (req.query.period as string) || "month";

      const analytics = await adminService.getFullAnalytics(period);

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
        error: error.message,
      });
    }
  }

  async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "month";

      const revenue = await adminService.getRevenueByPeriod(period);

      return res.status(200).json({
        success: true,
        data: revenue,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch revenue analytics",
        error: error.message,
      });
    }
  }

  async getTopPharmacies(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topPharmacies = await adminService.getTopPharmacies(limit);

      return res.status(200).json({
        success: true,
        data: topPharmacies,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch top pharmacies",
        error: error.message,
      });
    }
  }

  async getTopMedicines(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topMedicines = await adminService.getTopMedicines(limit);

      return res.status(200).json({
        success: true,
        data: topMedicines,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch top medicines",
        error: error.message,
      });
    }
  }
}

export default new AdminController();