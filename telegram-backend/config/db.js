import mongoose from "mongoose";

const connectDB = async () => {
  const DB = process.env.MONGO_URI;
  if (!DB) throw new Error("MONGO_URI not defined");
  await mongoose.connect(DB);
  console.log("✅ MongoDB connected");
};

export default connectDB;
