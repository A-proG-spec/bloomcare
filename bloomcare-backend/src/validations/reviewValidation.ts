import { z } from "zod";

export const createReviewSchema = z.object({
  pharmacyId: z.string()
    .min(1, "Pharmacy ID is required"),

  rating: z.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),

  comment: z.string()
    .min(1, "Comment is required")
    .max(500, "Comment must be less than 500 characters")
    .trim(),
});

export const updateReviewSchema = z.object({
  rating: z.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),

  comment: z.string()
    .min(1, "Comment is required")
    .max(500, "Comment must be less than 500 characters")
    .trim()
    .optional(),
});

export const getReviewsQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  sortBy: z.enum(["newest", "oldest", "highest", "lowest"]).optional().default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsQueryInput = z.infer<typeof getReviewsQuerySchema>;