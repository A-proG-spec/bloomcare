import { z } from "zod";

export const addToCartSchema = z.object({
  medicineId: z.string()
    .min(1, "Medicine ID is required"),
  pharmacyId: z.string()
    .min(1, "Pharmacy ID is required"),
  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      medicineId: z.string().min(1),
      pharmacyId: z.string().min(1),
      quantity: z.number().min(1),
      price: z.number().min(0),
      medicineName: z.string().min(1),
      pharmacyName: z.string().min(1),
      image: z.string().optional(),
      stockStatus: z.string().optional(),
    })
  ),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;