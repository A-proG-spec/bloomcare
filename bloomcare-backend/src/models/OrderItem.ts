import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem extends Document {
  order: Types.ObjectId;
  medicine: Types.ObjectId;
  quantity: number;
  price: number;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    medicine: {
      type: Schema.Types.ObjectId,
      ref: "Medicine",
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
  },
  {
    timestamps: true,
  }
);

export default model<IOrderItem>("OrderItem", orderItemSchema);