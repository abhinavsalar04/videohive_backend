import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { _id: userId } = req?.user;

  // views, subscribers, likes,
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    // $size only works on arrays but $channel is not an array -> code will not work
    // {
    //   $addFields: { subscribersCount: { $size: "$channel" } },
    // },
    {
      $count: "subscribersCount",
    },
  ]);

  const likesData = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $facet: {
        videoLikes: [
          {
            $lookup: {
              from: "likes",
              foreignField: "video",
              localField: "_id",
              as: "likesData",
            },
          },
          { $unwind: "$likesData" },
          {
            $group: {
              _id: null,
              videosLike: {
                $sum: {
                  $cond: [{ $ifNull: ["$likesData.video", false] }, 1, 0],
                },
              },
            },
          },
        ],
  
        commentLikes: [
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
            },
          },
          { $unwind: "$comments" },
          {
            $lookup: {
              from: "likes",
              localField: "comments._id",
              foreignField: "comment",
              as: "commentLikes",
            },
          },
          {
            $group: {
              _id: null,
              commentsLike: { $sum: { $size: "$commentLikes" } },
            },
          },
        ],
      },
    },
    {
      $project: {
        videosLike: { $arrayElemAt: ["$videoLikes.videosLike", 0] },
        commentsLike: { $arrayElemAt: ["$commentLikes.commentsLike", 0] },
      },
    },
  ]);
  
  const tweetsLike = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "tweet",
        localField: "_id",
        as: "tweetLikesData",
      }
    },
    {
      $unwind: "$tweetLikesData"
    },
    {
      $group: {
        _id: null,
        tweetsLike: {
         $sum: {
          $cond: [{$ifNull: ["$tweetLikesData.tweet", false]},1,0]
         } 
        }
      }
    }
  ])

  const videoRelatedData = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $addFields: {
        views: {
          $sum: { $cond: [{ $ifNull: ["$views", false] }, 1, 0] },
        },
      },
    },
    {
      $count: "count",
    },
  ]);

  if (!subscribers || !likesData || !videoRelatedData) {
    throw new APIError(500, "Server error! Unable to fetch dashboard data!");
  }

  const channelStats = {
    videosCount: videoRelatedData[0]?.count,
    videosViews: videoRelatedData[0]?.views,
    videosLike: likesData[0]?.videosLike,
    commentsLike: likesData[0]?.commentsLike,
    tweetsLike: tweetsLike[0]?.tweetsLike,
    channelSubscribers: subscribers[0]?.subscribersCount,
  };

  return res
    .status(200)
    .json(
      new APIResponse(200, "Channel stats  fetched successfully!", channelStats)
    );
});

const getAllVideosUploadedByChannel = asyncHandler(async (req, res) => {
  const { _id: userId } = req?.user;

  if (!userId) {
    throw new APIError(403, "Unauthorized access");
  }

  const videosData = await Video.find({
    owner: userId,
  });

  if (!videosData) {
    throw new APIError(500, "Server error! Unable to fetch uploaded videos");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "All videos fetched successfully", videosData));
});

export { getChannelStats, getAllVideosUploadedByChannel };
