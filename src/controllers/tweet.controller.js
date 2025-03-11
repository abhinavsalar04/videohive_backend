import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { APIError } from "./../utils/APIError.js";
import { APIResponse } from "./../utils/APIResponse.js";
import { asyncHandler } from "./../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req?.body;
  const ownerId = req?.user?._id;

  if (!content) {
    throw new APIError(401, "Invalid tweet content");
  }

  if (!ownerId) {
    throw new APIError(403, "Unauthorized access");
  }

  const createdTweet = await Tweet.create({
    content,
    owner: ownerId,
  });

  console.log(createdTweet);
  if (!createTweet) {
    throw new APIError(500, "Internal server error! Unable to create tweet!");
  }

  return res
    .status(201)
    .json(new APIResponse(201, "Tweet created successfully!", createdTweet));
});

const getTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new APIError(403, "Tweed Id is required!");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new APIError(500, "Internal server error. Unable to get tweets");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Tweet data fetched successfully!", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { _id } = req?.user;
  if (!_id) {
    throw new APIError(403, "Invalid user");
  }

  const tweets = await Tweet.find({
    owner: _id,
  });

  if (!tweets) {
    throw new APIError(500, "Internal server error. Unable to get tweets");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "User tweets fetched successfully!", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req?.body;
  const { tweetId } = req.params;

  if (!tweetId || !content) {
    throw new APIError(401, "tweetId and content are required");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content,
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new APIError(500, "Internal server error! Unable to update tweet.");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Tweet updated successfully!", updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new APIError(403, "Tweed Id is required!");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new APIError(500, "Internal server error. Unable to delete tweet");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Tweet deleted successfully!"));
});

export { createTweet, getTweet, getUserTweets, updateTweet, deleteTweet };
