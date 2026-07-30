import { Request, Response } from "express";
import { z } from "zod";
import reviewService from "../services/reviewService";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
} from "../validations/reviewValidation";

class ReviewController {
  // Create a review
  async createReview(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = createReviewSchema.parse((req as Request).body);

      const review = await reviewService.createReview({
        userId: user._id.toString(),
        pharmacyId: validatedData.pharmacyId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      });

      return res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review,
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
        message: error.message || "Failed to submit review",
      });
    }
  }

  // Get reviews for a pharmacy
  async getPharmacyReviews(req: Request, res: Response) {
    try {
      const pharmacyId = req.params.pharmacyId as string;

      if (!pharmacyId) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID is required",
        });
      }

      // ✅ FIX: Cast to Request to access query
      const validatedQuery = getReviewsQuerySchema.parse((req as Request).query);
      const { page, limit, sortBy } = validatedQuery;

      const result = await reviewService.getPharmacyReviews(
        pharmacyId,
        page || 1,
        limit || 10,
        sortBy
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

      return res.status(404).json({
        success: false,
        message: error.message || "Failed to fetch reviews",
      });
    }
  }

  // Get a single review
  async getReviewById(req: Request, res: Response) {
    try {
      const reviewId = req.params.id as string;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }

      const review = await reviewService.getReviewById(reviewId);

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Review not found",
      });
    }
  }

  // Update a review
  async updateReview(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params and body
      const reviewId = (req as Request).params.id as string;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }

      const validatedData = updateReviewSchema.parse((req as Request).body);

      const review = await reviewService.updateReview(
        reviewId,
        user._id.toString(),
        validatedData
      );

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
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
        message: error.message || "Failed to update review",
      });
    }
  }

  // Delete a review (user)
  async deleteReview(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const reviewId = (req as Request).params.id as string;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }

      const result = await reviewService.deleteReview(reviewId, user._id.toString());

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete review",
      });
    }
  }

  // Delete a review (admin)
  async deleteReviewByAdmin(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const reviewId = (req as Request).params.id as string;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }

      const result = await reviewService.deleteReviewByAdmin(reviewId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete review",
      });
    }
  }

  // Get user's review for a pharmacy
  async getUserReviewForPharmacy(req: AuthRequest, res: Response) {
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

      if (!pharmacyId) {
        return res.status(400).json({
          success: false,
          message: "Pharmacy ID is required",
        });
      }

      const review = await reviewService.getUserReviewForPharmacy(
        user._id.toString(),
        pharmacyId
      );

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to get user review",
        error: error.message,
      });
    }
  }

  // Get all reviews by the authenticated user
  async getUserReviews(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access query
      const { page, limit } = (req as Request).query;

      const result = await reviewService.getUserReviews(
        user._id.toString(),
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
        message: "Failed to fetch user reviews",
        error: error.message,
      });
    }
  }
}

export default new ReviewController();