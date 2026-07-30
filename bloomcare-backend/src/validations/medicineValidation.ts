import { z } from "zod";

export const createMedicineSchema = z.object({
  name: z.string()
    .min(2, "Medicine name must be at least 2 characters")
    .max(200, "Medicine name must be less than 200 characters")
    .trim(),

  genericName: z.string()
    .trim()
    .optional(),  // .trim() before .optional()

  category: z.string()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category must be less than 100 characters")
    .trim(),

  manufacturer: z.string()
    .min(2, "Manufacturer must be at least 2 characters")
    .max(200, "Manufacturer must be less than 200 characters")
    .trim(),

  description: z.string()
    .trim()
    .optional(),

  image: z.string()
    .url("Please provide a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateMedicineSchema = z.object({
  name: z.string()
    .min(2, "Medicine name must be at least 2 characters")
    .max(200, "Medicine name must be less than 200 characters")
    .trim()
    .optional(),

  genericName: z.string()
    .trim()
    .optional(),

  category: z.string()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category must be less than 100 characters")
    .trim()
    .optional(),

  manufacturer: z.string()
    .min(2, "Manufacturer must be at least 2 characters")
    .max(200, "Manufacturer must be less than 200 characters")
    .trim()
    .optional(),

  description: z.string()
    .trim()
    .optional(),

  image: z.string()
    .url("Please provide a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const addMedicineToPharmacySchema = z.object({
  pharmacyId: z.string()
    .min(1, "Pharmacy ID is required"),

  medicineId: z.string()
    .min(1, "Medicine ID is required"),

  price: z.number()
    .min(0, "Price must be at least 0")
    .positive("Price must be greater than 0"),

  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be at least 0"),
});

export const updateMedicineStockSchema = z.object({
  pharmacyId: z.string()
    .min(1, "Pharmacy ID is required"),

  medicineId: z.string()
    .min(1, "Medicine ID is required"),

  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be at least 0"),

  price: z.number()
    .min(0, "Price must be at least 0")
    .positive("Price must be greater than 0")
    .optional(),
});

export const getMedicinesQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
});

export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;
export type AddMedicineToPharmacyInput = z.infer<typeof addMedicineToPharmacySchema>;
export type UpdateMedicineStockInput = z.infer<typeof updateMedicineStockSchema>;
export type GetMedicinesQueryInput = z.infer<typeof getMedicinesQuerySchema>;