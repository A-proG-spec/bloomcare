import { Schema, model, Document, Types } from "mongoose";

export interface IPharmacyMedicine {
  medicine: Types.ObjectId;
  price: number;
  quantity: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface IPharmacy extends Document {
  name: string;
  owner: Types.ObjectId;
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
  image: string;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  medicines: IPharmacyMedicine[];
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    medicines: [
      {
        medicine: {
          type: Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
        stockStatus: {
          type: String,
          enum: ["In Stock", "Low Stock", "Out of Stock"],
          default: "Out of Stock",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for location-based queries
pharmacySchema.index({ latitude: 1, longitude: 1 });

export default model<IPharmacy>("Pharmacy", pharmacySchema);