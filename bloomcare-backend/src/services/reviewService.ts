import mongoose from "mongoose";
import Review from "../models/Review";
import Pharmacy from "../models/Pharmacy";
import Order from "../models/Order";
import { logger } from "../config/logger";

interface ICreateReviewData {
  userId: string;
  pharmacyId: string;
  rating: number;
  comment: string;
}

interface IUpdateReviewData {
  rating?: number;
  comment?: string;
}

class ReviewService {
  // Create a review
  async createReview(data: ICreateReviewData) {
    const { userId, pharmacyId, rating, comment } = data;

    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Check if user has already reviewed this pharmacy
    const existingReview = await Review.findOne({
      user: userId,
      pharmacy: pharmacyId,
    } as any); // ADDED as any

    if (existingReview) {
      throw new Error("You have already reviewed this pharmacy. You can update your existing review.");
    }

    // Optional: Check if user has ordered from this pharmacy (for authenticity)
    const hasOrdered = await Order.findOne({
      user: userId,
      pharmacy: pharmacyId,
      status: "Delivered",
    } as any); // ADDED as any

    // For MVP, we'll allow review without order, but we'll log a warning
    if (!hasOrdered) {
      logger.warn(`User ${userId} is reviewing pharmacy ${pharmacyId} without a delivered order.`);
    }

    // Create review
    const review = await Review.create({
      user: userId,
      pharmacy: pharmacyId,
      rating,
      comment,
    } as any); // ADDED as any

    // Update pharmacy rating
    await this.updatePharmacyRating(pharmacyId);

    // Populate user info
    const populatedReview = await Review.findById(review._id)
      .populate("user", "fullName email image");

    logger.info(`Review created for pharmacy ${pharmacyId} by user ${userId}`);

    return populatedReview;
  }

  // Get reviews for a pharmacy
  async getPharmacyReviews(
    pharmacyId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "newest"
  ) {
    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const skip = (page - 1) * limit;

    // Build sort object
    let sort: any = { createdAt: -1 };
    if (sortBy === "newest") sort = { createdAt: -1 };
    else if (sortBy === "oldest") sort = { createdAt: 1 };
    else if (sortBy === "highest") sort = { rating: -1 };
    else if (sortBy === "lowest") sort = { rating: 1 };

    const [reviews, total] = await Promise.all([
      Review.find({ pharmacy: pharmacyId } as any) // ADDED as any
        .populate("user", "fullName email image")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ pharmacy: pharmacyId } as any), // ADDED as any
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      pharmacyRating: pharmacy.rating,
      totalReviews: pharmacy.totalReviews,
    };
  }

  // Get a single review by ID
  async getReviewById(reviewId: string) {
    const review = await Review.findById(reviewId)
      .populate("user", "fullName email image")
      .populate("pharmacy", "name address phone image");

    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  }

  // Update a review
  async updateReview(reviewId: string, userId: string, data: IUpdateReviewData) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      throw new Error("You are not authorized to update this review");
    }

    // Update fields
    if (data.rating !== undefined) review.rating = data.rating;
    if (data.comment !== undefined) review.comment = data.comment;

    await review.save();

    // Update pharmacy rating
    await this.updatePharmacyRating(review.pharmacy.toString());

    const updatedReview = await Review.findById(reviewId)
      .populate("user", "fullName email image");

    logger.info(`Review ${reviewId} updated by user ${userId}`);

    return updatedReview;
  }

  // Delete a review
  async deleteReview(reviewId: string, userId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      throw new Error("You are not authorized to delete this review");
    }

    const pharmacyId = review.pharmacy.toString();

    await Review.findByIdAndDelete(reviewId);

    // Update pharmacy rating
    await this.updatePharmacyRating(pharmacyId);

    logger.info(`Review ${reviewId} deleted by user ${userId}`);

    return { success: true, message: "Review deleted successfully" };
  }

  // Delete a review (Admin only)
  async deleteReviewByAdmin(reviewId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    const pharmacyId = review.pharmacy.toString();

    await Review.findByIdAndDelete(reviewId);

    // Update pharmacy rating
    await this.updatePharmacyRating(pharmacyId);

    logger.info(`Review ${reviewId} deleted by admin`);

    return { success: true, message: "Review deleted by admin successfully" };
  }

  // Update pharmacy rating and totalReviews count
  private async updatePharmacyRating(pharmacyId: string) {
    const result = await Review.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId) } },
      {
        $group: {
          _id: "$pharmacy",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = result.length > 0 ? parseFloat(result[0].averageRating.toFixed(1)) : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

    await Pharmacy.findByIdAndUpdate(pharmacyId, {
      rating: avgRating,
      totalReviews: totalReviews,
    });

    logger.info(`Updated rating for pharmacy ${pharmacyId}: ${avgRating} (${totalReviews} reviews)`);
  }

  // Get user's review for a pharmacy
  async getUserReviewForPharmacy(userId: string, pharmacyId: string) {
    const review = await Review.findOne({
      user: userId,
      pharmacy: pharmacyId,
    } as any).populate("user", "fullName email image"); // ADDED as any

    return review;
  }

  // Get all reviews by a user
  async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId } as any) // ADDED as any
        .populate("pharmacy", "name address phone image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ user: userId } as any), // ADDED as any
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new ReviewService();