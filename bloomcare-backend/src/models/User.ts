import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  image: string;
  role: "admin" | "user" | "pharmacy_owner";
  isEmailVerified: boolean;
  
  refreshToken?: string;
  otp?: string;
  otpExpires?: Date;
  
  pharmacyApplication?: {
    status: "pending" | "approved" | "rejected";
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
  };
  
  ownedPharmacy?: Types.ObjectId;
  
  // ✅ ADD THESE - Required by timestamps: true
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "user", "pharmacy_owner"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    pharmacyApplication: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      submittedAt: Date,
      reviewedAt: Date,
      rejectionReason: String,
    },
    ownedPharmacy: {
      type: Schema.Types.ObjectId,
      ref: "Pharmacy",
    },
  },
  {
    timestamps: true, // ✅ This adds createdAt and updatedAt
  }
);

export default model<IUser>("User", userSchema);