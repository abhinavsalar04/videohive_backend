import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { _id: userId } = req?.user;

  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "Missing or invalid channelId");
  }

  const updatedSubscriptionData = await Subscription.findOneAndDelete({
    channel: channelId,
    subscriber: userId,
  });

  if (!updatedSubscriptionData) {
    const createdSubscription = await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });
    if (!createdSubscription) {
      throw new APIError(500, "Server error! Unabled to subscribe channel");
    }
    return res.status(200).json(new APIResponse(200, "Channel subscribed!"));
  } else {
    return res.status(200).json(new APIResponse(200, "Channel unsubscribed!"));
  }
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "ChannelId is missing or invalid");
  }

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              avatar: 1,
              fullName: 1,
            }
          }
        ]
      },
    },
    {
      $addFields: {
        subscriber: { $first: "$subscriber" },
      },
    },
    {
      $project: {
        _id: 1,
        subscriber: 1,
      }
    }
  ]);

  if (!channelSubscribers) {
    throw new APIError(500, "Unable to get channel subscribers");
  }
  
  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        "Channel subscribers fetched successfully!",
        channelSubscribers
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  if (!isValidObjectId(userId)) {
    throw new APIError(400, "ChannelId is missing or invalid");
  }

  const channelsSubscribedTo = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              _id: 1,
              username:1,
              email: 1,
              fullName: 1,
              avatar: 1,
            }
          }
        ]
      },
    },
    {
      $addFields: {
        channel: { $first: "$channel" },
      },
    },
    {
      $project: {
        _id: 1,
        channel: 1
      }
    }
  ]);

  if (!channelsSubscribedTo) {
    throw new APIError(500, "Unable to get subscribed channels");
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        "Channel subscriber fetched successfully!",
        channelsSubscribedTo
      )
    );
}); 

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
