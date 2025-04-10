import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import {Comment} from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req?.params;
  const { _id: owner } = req.user;

  if (!videoId) {
    throw new APIError(400, "VideoId is missing!");
  }

  const isVideoExists = await Video.findById(videoId);
  if (!isVideoExists) {
    throw new APIError(400, "Invalid videoId!");
  }

  const matchedDocument = await Like.findOneAndUpdate({
    video: videoId,
    likedBy: owner,
  });

  if (!matchedDocument) {
    const likeData = await Like.create({ video: videoId, likedBy: owner });
    if (!likeData) {
      throw new APIError(500, "Server error! Unable to like video!");
    }
    return res.status(201).json(new APIResponse(201, "Video liked!"));
  } else {
    await Like.findByIdAndDelete(matchedDocument?._id);
    return res.status(200).json(new APIResponse(200, "Video like removed!"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req?.params;
  const { _id: owner } = req.user;

  if (!commentId) {
    throw new APIError(400, "CommentId is missing!");
  }

  const isCommentExists = await Comment.findById(commentId);
  if (!isCommentExists) {
    throw new APIError(400, "Invalid commentId!");
  }

  const matchedDocument = await Like.findOneAndUpdate({
    comment: commentId,
    likedBy: owner,
  });

  if (!matchedDocument) {
    const likeData = await Like.create({ comment: commentId, likedBy: owner });
    if (!likeData) {
      throw new APIError(500, "Server error! Unable to like comment!");
    }
    return res.status(201).json(new APIResponse(201, "Comment liked!"));
  } else {
    await Like.findByIdAndDelete(matchedDocument?._id);
    return res.status(200).json(new APIResponse(200, "Comment like removed!"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req?.params;
  const { _id: owner } = req.user;

  if (!tweetId) {
    throw new APIError(400, "TweetId is missing!");
  }

  const isTweetExists = await Tweet.findById(tweetId);
  if (!isTweetExists) {
    throw new APIError(400, "Invalid tweetId!");
  }
  const matchedDocument = await Like.findOneAndUpdate({
    tweet: tweetId,
    likedBy: owner,
  });

  if (!matchedDocument) {
    const likeData = await Like.create({ tweet: tweetId, likedBy: owner });
    if (!likeData) {
      throw new APIError(500, "Server error! Unable to like tweet!");
    }
    return res.status(201).json(new APIResponse(201, "Tweet liked!"));
  } else {
    await Like.findByIdAndDelete(matchedDocument?._id);
    return res.status(200).json(new APIResponse(200, "Tweet like removed!"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { _id: likedBy } = req.user;
  const likedVideos = await Like.find({
    $and: [{ likedBy: likedBy }, { video: { $ne: null } }],
  }).select("-tweet -comment -likedBy");

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        "All liked videos fetched successfully!",
        likedVideos
      )
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };


// Todo's
//  add get video, comment, tweet response isLiked and total likes 