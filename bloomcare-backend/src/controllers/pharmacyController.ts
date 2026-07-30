import { Request, Response } from "express";
import { z } from "zod";
import pharmacyService from "../services/pharmacyService";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  pharmacyApplicationSchema,
  pharmacyUpdateSchema,
  applicationReviewSchema,
} from "../validations/pharmacyValidation";
import Pharmacy from "../models/Pharmacy";

class PharmacyController {
  // User applies to become a pharmacy owner
  async applyForPharmacy(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = pharmacyApplicationSchema.parse((req as Request).body);

      const application = await pharmacyService.applyForPharmacy({
        userId: user._id.toString(),
        pharmacyName: validatedData.pharmacyName,
        address: validatedData.address,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        phone: validatedData.phone,
        email: validatedData.email,
        website: validatedData.website,
        openingHours: validatedData.openingHours,
      });

      return res.status(201).json({
        success: true,
        message: "Pharmacy application submitted successfully",
        data: application,
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
        message: error.message || "Failed to submit application",
      });
    }
  }

  // Get my application status
  async getMyApplication(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const application = await pharmacyService.getMyApplication(
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "No application found",
      });
    }
  }

  // Admin - Get all applications
  async getAllApplications(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query;

      const result = await pharmacyService.getAllApplications(
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
        message: "Failed to fetch applications",
        error: error.message,
      });
    }
  }

  async reviewApplication(req: AuthRequest, res: Response) {
    try {
      const admin = req.user;
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      // ✅ FIX: Cast to Request to access params and body
      const id = (req as Request).params.id as string;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
      }

      const validatedData = applicationReviewSchema.parse((req as Request).body);

      const result = await pharmacyService.reviewApplication({
        applicationId: id,
        status: validatedData.status,
        adminNotes: validatedData.adminNotes,
        adminId: admin._id.toString(),
      });

      return res.status(200).json({
        success: true,
        message: `Application ${validatedData.status}`,
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

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to review application",
      });
    }
  }

  // Update pharmacy details
  async updatePharmacy(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = pharmacyUpdateSchema.parse((req as Request).body);

      const updatedPharmacy = await pharmacyService.updatePharmacy(
        user._id.toString(),
        validatedData
      );

      return res.status(200).json({
        success: true,
        message: "Pharmacy updated successfully",
        data: updatedPharmacy,
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
        message: error.message || "Failed to update pharmacy",
      });
    }
  }

  async getPharmacies(req: Request, res: Response) {
    try {
      const { search, isActive, page, limit } = req.query;

      const isActiveBool = isActive === "true" ? true : isActive === "false" ? false : undefined;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;

      const result = await pharmacyService.getPharmacies(
        search as string,
        isActiveBool,
        pageNum,
        limitNum
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

  async getMyPharmacy(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const result = await pharmacyService.getMyPharmacyOrApplication(
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error in getMyPharmacy:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch pharmacy",
      });
    }
  }

  // ===== GET single pharmacy by ID =====
  async getPharmacyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID is required",
        });
      }

      const pharmacy = await pharmacyService.getPharmacyById(id);

      return res.status(200).json({
        success: true,
        data: pharmacy,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Pharmacy not found",
      });
    }
  }

  // Get nearby pharmacies
  async getNearbyPharmacies(req: Request, res: Response) {
    try {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const pharmacies = await pharmacyService.getNearbyPharmacies(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string) || 10
      );

      return res.status(200).json({
        success: true,
        data: pharmacies,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch nearby pharmacies",
        error: error.message,
      });
    }
  }
}

export default new PharmacyController();