import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { APIError } from "./APIError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localFilePath) {
  try {
    if (!localFilePath) throw new Error("File path not found!");

    // uplaod file on cloudinary
    const fileUploadResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // detect file type from file
    }); 

    fs.unlinkSync(localFilePath);
    return fileUploadResponse;
  } catch (error) {
    // if file upload operation fails then remove temporary file from server
    fs.unlinkSync(localFilePath);
    throw new Error(error.message);
  }
}

async function removeFromCloudinary(assetPublicId) {
  try {
    if (!assetPublicId) throw new Error("Could not find public_id");
    const response = await cloudinary.uploader.destroy(assetPublicId);
    return response
  } catch (error) {
    throw new APIError(500, error?.message);
  }
}

export { uploadOnCloudinary, removeFromCloudinary };
