import { z } from "zod";

export const createOrderSchema = z.object({
  pharmacyId: z.string()
    .min(1, "Pharmacy ID is required"),

  items: z.array(
    z.object({
      medicineId: z.string()
        .min(1, "Medicine ID is required"),
      quantity: z.number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1"),
    })
  )
    .min(1, "At least one item is required"),

  // ✅ Payment method validation
  paymentMethod: z.enum(["cod", "online"]).default("cod"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]),
  note: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string()
    .min(1, "Cancellation reason is required")
    .max(500, "Reason must be less than 500 characters"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;