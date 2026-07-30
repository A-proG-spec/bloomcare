import { Schema, model, Document, Types } from "mongoose";

// ✅ FIXED: Added createdAt and updatedAt to the interface
export interface IPharmacyApplication extends Document {
  user: Types.ObjectId;
  pharmacyName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  openingHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  documents: {
    businessLicense?: string;
    pharmacyLicense?: string;
    idProof?: string;
    additionalDocs?: string[];
  };
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  // ✅ ADD THESE FIELDS
  createdAt: Date;
  updatedAt: Date;
}

const pharmacyApplicationSchema = new Schema<IPharmacyApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pharmacyName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    website: {
      type: String,
    },
    openingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
    documents: {
      businessLicense: String,
      pharmacyLicense: String,
      idProof: String,
      additionalDocs: [String],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // ✅ This adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
pharmacyApplicationSchema.index({ user: 1, status: 1 });
pharmacyApplicationSchema.index({ status: 1, createdAt: -1 });

export default model<IPharmacyApplication>("PharmacyApplication", pharmacyApplicationSchema);