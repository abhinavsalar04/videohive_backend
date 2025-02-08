import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header?.["Authorization"]?.replace("Bearer ", "");

  if (!accessToken) {
    throw new APIError(401, "Unauthorized access!");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );
    
  if (!user) {
    throw new APIError(400, "Invalid access token!");
  }

  req.user = user;
  next();
});
