import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { configDotenv } from "dotenv";

configDotenv();

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected✅✅ | DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    throw error;
  }
}

export default connectDB;
