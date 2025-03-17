import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sortBy, sortType } = req.query;
  const { userId } = req.params;

  if (!userId) {
    throw new APIError(400, "UserId is required!");
  }

  const searchRegex = new RegExp(search, "i");
  const searchQuery = {
    owner: userId,
  };

  if (search?.trim()) {
    searchQuery.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const sortingParams = {};
  if (sortBy && sortType) {
    sortingParams[sortBy] = sortType === "asc" ? 1 : -1;
  }

  const documentsCount = await Video.countDocuments(searchQuery);
  const totalPages = Math.max(Math.ceil(documentsCount / limit), 1);
  const skippedDocuments = (page - 1) * limit;

  const videosData = await Video.find(searchQuery)
    .sort(sortingParams)
    .skip(skippedDocuments)
    .limit(limit);

  if (!videosData) {
    throw new APIError(400, "Invalid userId!");
  }

  return res.status(200).json(
    new APIResponse(200, "Videos fetched successfully!", {
      videos: videosData,
      pages: totalPages,
      count: documentsCount,
    })
  );
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

  const video = await Video.findById(videoId).select("-owner");

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

  if (!_id) {
    throw new APIError(403, "Invalid user!");
  }

  const { title, description } = req.body;
  const thumbnailFileLocalPath = req?.file?.path;

  if ([title, description]?.some((item) => !item || item?.trim() === "")) {
    throw new APIError(400, "Title or description is missing");
  }

  const thumbnailCloudinaryResponse = thumbnailFileLocalPath
    ? await uploadOnCloudinary(thumbnailFileLocalPath)
    : null;

  if (thumbnailFileLocalPath && !thumbnailCloudinaryResponse) {
    throw new APIError(500, "Server error! Unable to upload thumbnail");
  }

  const publishedVideo = await Video.findByIdAndUpdate(
    videoId,
    [
      {
        $set: {
          title,
          description,
          thumbnail: { $ifNull: [thumbnailCloudinaryResponse?.url, "$age"] },
        },
      },
    ],
    { new: true }
  ).select("-owner");

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

  const video = await Video.findByIdAndUpdate(videoId, [
    { $set: { isPublished: { $not: ["$isPublished"] } } },
  ]).select("-owner");

  if (!video) {
    throw new APIError(400, "Invalid videoId!");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        `Video ${video?.isPublished ? "published" : "unpublished"} successfully!`,
        video
      )
    );
});

export {
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  publishVideo,
  togglePublishStatus,
};
