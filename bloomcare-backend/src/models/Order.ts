import { Schema, model, Document, Types } from "mongoose";

export interface IOrder extends Document {
  user: Types.ObjectId;
  pharmacy: Types.ObjectId;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  orderDate: Date;
  
  // Payment fields
  paymentMethod: "cod" | "online" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId?: string;
  paymentDetails?: {
    transactionId?: string;
    paymentGateway?: string;
    paidAt?: Date;
  };
  
  // Delivery fields
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress?: {
    address: string;
    coordinates?: { lat: number; lng: number };
    instructions?: string;
    contactPhone: string;
    landmark?: string;
  };
  deliveryStatus: "pending" | "processing" | "dispatched" | "delivered" | "failed";
  deliveryFee: number;
  specialInstructions?: string;
}

const orderSchema = new Schema<IOrder>(
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
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "bank_transfer"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
    },
    paymentDetails: {
      transactionId: String,
      paymentGateway: String,
      paidAt: Date,
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    deliveryAddress: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      instructions: String,
      contactPhone: String,
      landmark: String,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "dispatched", "delivered", "failed"],
      default: "pending",
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    specialInstructions: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for items
orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order',
});

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ pharmacy: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export default model<IOrder>("Order", orderSchema);