import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error);

    process.exit(1);
  }
};

export default connectDatabase;