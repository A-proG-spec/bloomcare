import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  order: Types.ObjectId;
  user: Types.ObjectId;
  pharmacy: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'telebirr' | 'mobile_money' | 'bank_transfer';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  transactionId: string;
  paymentIntentId?: string;
  chapaCheckoutUrl?: string;
  metadata: {
    orderId: string;
    pharmacyName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
  paymentDetails?: {
    chapaStatus?: string;
    paymentMethodUsed?: string;
    paidAt?: Date;
    failureReason?: string;
    refundedAt?: Date;
    refundId?: string;
    refundAmount?: number;
    refundReason?: string;
  };
}

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ETB",
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'telebirr', 'mobile_money', 'bank_transfer'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentIntentId: {
      type: String,
    },
    chapaCheckoutUrl: {
      type: String,
    },
    metadata: {
      orderId: { type: String, required: true },
      pharmacyName: { type: String },
      customerEmail: { type: String },
      customerPhone: { type: String },
    },
    paymentDetails: {
      chapaStatus: { type: String },
      paymentMethodUsed: { type: String },
      paidAt: { type: Date },
      failureReason: { type: String },
      refundedAt: { type: Date },
      refundId: { type: String },
      refundAmount: { type: Number },
      refundReason: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ createdAt: -1 });

export default model<IPayment>("Payment", paymentSchema);