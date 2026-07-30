import { Router } from "express";
import reviewController from "../controllers/reviewController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
} from "../validations/reviewValidation";

const router = Router();

// Public routes (view reviews)
router.get(
  "/pharmacy/:pharmacyId",
  validate(getReviewsQuerySchema.partial()), // partial to allow query params optional
  reviewController.getPharmacyReviews
);

router.get(
  "/:id",
  reviewController.getReviewById
);

// Protected routes (authentication required)
router.use(authenticate);

// Create review
router.post(
  "/",
  validate(createReviewSchema),
  reviewController.createReview
);

// Update review
router.put(
  "/:id",
  validate(updateReviewSchema),
  reviewController.updateReview
);

// Delete review (user)
router.delete(
  "/:id",
  reviewController.deleteReview
);

// Get user's review for a pharmacy
router.get(
  "/my-review/pharmacy/:pharmacyId",
  reviewController.getUserReviewForPharmacy
);

// Get all reviews by the authenticated user
router.get(
  "/my-reviews",
  reviewController.getUserReviews
);

// Admin only - delete any review
router.delete(
  "/admin/:id",
  authorize("admin"),
  reviewController.deleteReviewByAdmin
);

export default router;