import { z } from "zod";

export const pharmacyApplicationSchema = z.object({
  pharmacyName: z.string()
    .min(2, "Pharmacy name must be at least 2 characters")
    .max(100, "Pharmacy name must be less than 100 characters")
    .trim(),

  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .trim(),

  latitude: z.number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),

  longitude: z.number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),

  phone: z.string()
    .min(5, "Phone number is required"),

  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  website: z.string()
    .url("Please provide a valid URL")
    .optional()
    .or(z.literal('')),

  openingHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
});

export const pharmacyUpdateSchema = z.object({
  name: z.string()
    .min(2, "Pharmacy name must be at least 2 characters")
    .max(100, "Pharmacy name must be less than 100 characters")
    .optional(),

  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .optional(),

  latitude: z.number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),

  longitude: z.number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  phone: z.string()
    .min(5, "Phone number is required")
    .optional(),

  email: z.string()
    .email("Please provide a valid email address")
    .optional(),

  website: z.string()
    .url("Please provide a valid URL")
    .optional()
    .or(z.literal('')),

  openingHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),

  isActive: z.boolean().optional(),
});

export const applicationReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().optional(),
});

export type PharmacyApplicationInput = z.infer<typeof pharmacyApplicationSchema>;
export type PharmacyUpdateInput = z.infer<typeof pharmacyUpdateSchema>;
export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;