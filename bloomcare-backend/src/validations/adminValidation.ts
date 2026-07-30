import { z } from "zod";

export const getUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "user", "pharmacy_owner"]).optional(),
  isEmailVerified: z.string().optional().transform((val) => val === "true"),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "user", "pharmacy_owner"]),
});

export const getOrdersQuerySchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
});

export const getAnalyticsQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).optional().default("month"),
});

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type GetOrdersQueryInput = z.infer<typeof getOrdersQuerySchema>;
export type GetAnalyticsQueryInput = z.infer<typeof getAnalyticsQuerySchema>;