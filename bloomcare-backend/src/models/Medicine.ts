import { Schema, model, Document } from "mongoose";

export interface IMedicine extends Document {
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: true,
    },
    genericName: {
      type: String,
    },
    category: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default model<IMedicine>("Medicine", medicineSchema);