import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
  /**
   * check if req.body contains all required fields (username, email, password, fullName, avatar)
   * check is username or email is already taken
   * upload user avatar or coverImage(if exists) to cloudinary
   * create user object - create entry in db
   * return response after removing password & refreshtoken
   * check for user creation
   * return response
   *
   */
  const { email, username, fullName, password } = req.body;
  if (
    [email, username, fullName, password]?.some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new APIError(400, "Some required fields are missing!");
  }

  const isUserExists = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (isUserExists) {
    console.log("User already exists!");
    throw new APIError(409, "User already exists!");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath =
    req.files?.coverImage && Array.isArray(req.files?.coverImage)
      ? req.files?.coverImage?.[0]?.path
      : req.files?.coverImage?.path || null; // if the field contains single file multer.single("file_path") => path = "string"

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file is required!");
  }

  const avatarCloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
  let coverImageCloudinaryResponse = null;
  if (coverImageLocalPath) {
    coverImageCloudinaryResponse =
      await uploadOnCloudinary(coverImageLocalPath);
  }

  if (!avatarCloudinaryResponse) {
    throw new APIError(500, "Server error: Unable to upload avatar image!");
  }

  const user = await User.create({
    username: username?.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatarCloudinaryResponse?.url,
    coverImage: coverImageCloudinaryResponse
      ? coverImageCloudinaryResponse?.url
      : "",
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registering the user!");
  }

  res
    .status(201)
    .json(new APIResponse(200, "User registered successfully!", createdUser));
});

export { registerUser };
