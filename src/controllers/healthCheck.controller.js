import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new APIResponse(200, "All End points are up and running!"));
});

export { healthCheck };
