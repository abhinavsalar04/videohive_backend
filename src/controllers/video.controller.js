import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sortBy, sortType, userId } = req.query;
  
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { _id } = req.user;

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;

  if (
    [title, description, videoFileLocalPath, thumbnailFileLocalPath]?.some(
      (item) => !item || item?.trim() === ""
    )
  ) {
    throw new APIError(
      400,
      "Title, description, video, thumbnail one of these fields is missing"
    );
  }

  const videoCloudinaryResponse = await uploadOnCloudinary(videoFileLocalPath);

  if (!videoCloudinaryResponse) {
    throw new APIError(500, "Server error! Unable to upload video");
  }

  const thumbnailCloudinaryResponse = await uploadOnCloudinary(
    thumbnailFileLocalPath
  );

  if (!thumbnailCloudinaryResponse) {
    throw new APIError(500, "Server error! Unable to upload thumbnail");
  }

  const publishedVideo = await Video.create({
    title,
    description,
    thumbnail: thumbnailCloudinaryResponse?.url,
    videoFile: videoCloudinaryResponse?.url,
    duration: videoCloudinaryResponse?.duration,
    views: 0,
    isPublished: true,
    owner: _id,
  });

  if (!publishedVideo) {
    throw new APIError(500, "Server error! Unable to publish video");
  }

  return res
    .status(200)
    .json(
      new APIResponse(201, "Video published successfully!", publishedVideo)
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(400, "Invalid videoId!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Video details fetched successfully!", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { _id } = req.user;
  
  if(!_id) {
    throw new APIError(403, "Invalid user!")
  }
  
  const { title, description } = req.body;
  const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;

  if ([title, description]?.some((item) => !item || item?.trim() === "")) {
    throw new APIError(400, "Title or description is missing");
  }

  const thumbnailCloudinaryResponse = thumbnailFileLocalPath
    ? await uploadOnCloudinary(thumbnailFileLocalPath)
    : null;

  if (!thumbnailCloudinaryResponse) {
    throw new APIError(500, "Server error! Unable to upload thumbnail");
  }

  const publishedVideo = await Video.findByIdAndUpdate(videoId, [
    {
      $set: {
        title,
        description,
        thumbnail: { $ifNull: [thumbnailCloudinaryResponse?.url, "$age"] },
      },
    },
  ]);

  if (!publishedVideo) {
    throw new APIError(500, "Server error! Unable to publish video");
  }

  return res
    .status(200)
    .json(
      new APIResponse(201, "Video published successfully!", publishedVideo)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required!");
  }

  const video = await Video.findByIdAndDelete(videoId, { new: true });

  if (!video) {
    throw new APIError(400, "Invalid videoId!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Video deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required!");
  }

  // this is the way to use existing field value.
  const video = await Video.findByIdAndUpdate(videoId, [
    { $set: { isValid: { $not: ["$isValid"] } } },
  ]);

  if (!video) {
    throw new APIError(400, "Invalid videoId!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Video deleted successfully!"));
});

return {
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  publishVideo,
  togglePublishStatus,
};
