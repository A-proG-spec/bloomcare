import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  pharmacy: Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per pharmacy
reviewSchema.index({ user: 1, pharmacy: 1 }, { unique: true });

export default model<IReview>("Review", reviewSchema);