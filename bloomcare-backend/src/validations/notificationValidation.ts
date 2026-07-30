import { z } from "zod";

export const getNotificationsQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  isRead: z.string().optional().transform((val) => val === "true"),
});

export const markNotificationsAsReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().optional().default(false),
});

export type GetNotificationsQueryInput = z.infer<typeof getNotificationsQuerySchema>;
export type MarkNotificationsAsReadInput = z.infer<typeof markNotificationsAsReadSchema>;