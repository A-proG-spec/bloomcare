import { Request, Response } from "express";
import { z } from "zod";
import medicineService from "../services/medicineService";
import { AuthRequest } from "../middleware/authMiddleware";
import Pharmacy from "../models/Pharmacy";
import {
  createMedicineSchema,
  updateMedicineSchema,
  addMedicineToPharmacySchema,
  updateMedicineStockSchema,
  getMedicinesQuerySchema,
} from "../validations/medicineValidation";

class MedicineController {
  // Create medicine (Admin only)
  async createMedicine(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Only admin can create medicines
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = createMedicineSchema.parse((req as Request).body);

      const medicine = await medicineService.createMedicine(validatedData);

      return res.status(201).json({
        success: true,
        message: "Medicine created successfully",
        data: medicine,
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
        message: error.message || "Failed to create medicine",
      });
    }
  }

  // Get all medicines
  async getMedicines(req: Request, res: Response) {
    try {
      const validatedQuery = getMedicinesQuerySchema.parse(req.query);
      
      const { search, category, manufacturer, page, limit } = validatedQuery;

      const result = await medicineService.getMedicines(
        search,
        category,
        manufacturer,
        page || 1,
        limit || 10
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
        message: "Failed to fetch medicines",
        error: error.message,
      });
    }
  }

  // Get single medicine
  async getMedicineById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Medicine ID is required",
        });
      }

      const result = await medicineService.getMedicineById(id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Medicine not found",
      });
    }
  }

  // Update medicine (Admin only)
  async updateMedicine(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Only admin can update medicines
      if (user.role !== "admin") {
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
          message: "Medicine ID is required",
        });
      }

      const validatedData = updateMedicineSchema.parse((req as Request).body);

      const medicine = await medicineService.updateMedicine(id, validatedData);

      return res.status(200).json({
        success: true,
        message: "Medicine updated successfully",
        data: medicine,
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
        message: error.message || "Failed to update medicine",
      });
    }
  }

  // Delete medicine (Admin only)
  async deleteMedicine(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Only admin can delete medicines
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const id = (req as Request).params.id as string;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Medicine ID is required",
        });
      }

      const result = await medicineService.deleteMedicine(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete medicine",
      });
    }
  }

  // Add medicine to pharmacy (Pharmacy owner only)
  async addMedicineToPharmacy(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = addMedicineToPharmacySchema.parse((req as Request).body);

      // Check if user owns the pharmacy
      const pharmacy = await Pharmacy.findById(validatedData.pharmacyId);
      if (!pharmacy) {
        return res.status(404).json({
          success: false,
          message: "Pharmacy not found",
        });
      }

      if (pharmacy.owner.toString() !== user._id.toString() && user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You don't own this pharmacy",
        });
      }

      const result = await medicineService.addMedicineToPharmacy(validatedData);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.medicine,
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
        message: error.message || "Failed to add medicine to pharmacy",
      });
    }
  }

  // Update medicine stock (Pharmacy owner only)
  async updateMedicineStock(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = updateMedicineStockSchema.parse((req as Request).body);

      // Check if user owns the pharmacy
      const pharmacy = await Pharmacy.findById(validatedData.pharmacyId);
      if (!pharmacy) {
        return res.status(404).json({
          success: false,
          message: "Pharmacy not found",
        });
      }

      if (pharmacy.owner.toString() !== user._id.toString() && user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You don't own this pharmacy",
        });
      }

      const result = await medicineService.updateMedicineStock(validatedData);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.medicine,
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
        message: error.message || "Failed to update medicine stock",
      });
    }
  }

  // Remove medicine from pharmacy
  async removeMedicineFromPharmacy(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const pharmacyId = (req as Request).params.pharmacyId as string;
      const medicineId = (req as Request).params.medicineId as string;

      if (!pharmacyId || !medicineId) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID and Medicine ID are required",
        });
      }

      // Check if user owns the pharmacy
      const pharmacy = await Pharmacy.findById(pharmacyId);
      if (!pharmacy) {
        return res.status(404).json({
          success: false,
          message: "Pharmacy not found",
        });
      }

      if (pharmacy.owner.toString() !== user._id.toString() && user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You don't own this pharmacy",
        });
      }

      const result = await medicineService.removeMedicineFromPharmacy(pharmacyId, medicineId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to remove medicine from pharmacy",
      });
    }
  }

  // Get medicines by pharmacy
  async getMedicinesByPharmacy(req: Request, res: Response) {
    try {
      const pharmacyId = req.params.pharmacyId as string;
      const { search, inStockOnly, page, limit } = req.query;

      if (!pharmacyId) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID is required",
        });
      }

      const result = await medicineService.getMedicinesByPharmacy(
        pharmacyId,
        search as string,
        inStockOnly === "true",
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Failed to fetch medicines",
      });
    }
  }

  // Get categories
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await medicineService.getCategories();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
      });
    }
  }

  // Get manufacturers
  async getManufacturers(req: Request, res: Response) {
    try {
      const manufacturers = await medicineService.getManufacturers();

      return res.status(200).json({
        success: true,
        data: manufacturers,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch manufacturers",
        error: error.message,
      });
    }
  }

  // Search medicines (autocomplete)
  async searchMedicines(req: Request, res: Response) {
    try {
      const { q, limit } = req.query;

      if (!q || (q as string).length < 2) {
        return res.status(400).json({
          success: false,
          message: "Search query must be at least 2 characters",
        });
      }

      const results = await medicineService.searchMedicines(
        q as string,
        parseInt(limit as string) || 10
      );

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to search medicines",
        error: error.message,
      });
    }
  }
}

export default new MedicineController();