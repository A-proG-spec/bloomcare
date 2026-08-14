// src/models/Cart.ts
import { Schema, model, Document, Types } from "mongoose";

// ============================================================
// ✅ INTERFACES
// ============================================================

export interface ICartItem {
  medicineId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  quantity: number;
  price: number;
  medicineName: string;
  pharmacyName: string;
  image: string;
  stockStatus: string;
  addedAt: Date;
}

export interface ICart extends Document {
  user?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  status: 'active' | 'abandoned' | 'converted';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// ✅ CART ITEM SCHEMA
// ============================================================

const cartItemSchema = new Schema<ICartItem>({
  medicineId: {
    type: Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  pharmacyId: {
    type: Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  medicineName: {
    type: String,
    required: true,
  },
  pharmacyName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  stockStatus: {
    type: String,
    default: 'In Stock',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
    },
    sessionId: {
      type: String,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ sessionId: 1, status: 1 });

export default model<ICart>("Cart", cartSchema);