import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const { _id: owner, username, email, avatar, coverImage } = req.user;

  if (!content || !videoId) {
    throw new APIError(400, "Content or videoId is missing!");
  }

  const createdComment = await Comment.create({
    owner,
    video: videoId,
    content,
  });

  const updatedCommentData = {
    ...createdComment.toObject(),
    owner: { username, email, avatar, coverImage },
  };

  return res
    .status(201)
    .json(
      new APIResponse(201, "Comment added successfully!", updatedCommentData)
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const { _id: owner, username, email, avatar, coverImage } = req.user;

  if (!content || !commentId) {
    throw new APIError(400, "CommentId or content is missing!");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content,
    },
    { new: true }
  );

  if(!updatedComment){
    throw new APIError(400, "Invalid comment data!")
  }
  
  const updatedCommentWithAppendedUserDetails = {
    ...updatedComment.toObject(),
    owner: { username, email, avatar, coverImage },
  };

  console.log(updatedCommentWithAppendedUserDetails, username);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        "Comment updated successfully!",
        updatedCommentWithAppendedUserDetails
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req?.params;
  if (!commentId) {
    throw new APIError("CommentId is missing!");
  }

  const response = await Comment.findByIdAndDelete(commentId);
  if (!response) {
    throw new APIError(400, "Comment data not found!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Comment deleted successfully!"));
});

// there is some issue with thie.
const getCommentById = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { _id: owner, username, email, avatar, coverImage } = req.user;

  if (!commentId) {
    throw new APIError(400, "CommentId is missing!");
  }

  const commentData = await Comment.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(commentId) } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              _id: 1,
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: { $first: "$video" },
      },
    },
  ]);

  console.log({ data: commentData[0] });
  const commentDataWithAppendedUserData = {
    ...commentData[0],
    owner: { username, email, avatar, coverImage },
  };

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        "Comment data fetched successfully!",
        commentDataWithAppendedUserData
      )
    );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req?.params;
  const { page = 1, limit = 10 } = req?.query;

  const documentsCount = await Comment.countDocuments({ video: videoId });
  const totalPages = Math.max(Math.ceil(documentsCount / limit), 1);
  const skippedDocuments = (page - 1) * limit;

  const commentsData = await Comment.find({ video: videoId })
    .skip(skippedDocuments)
    .limit(limit);

  if (!commentsData) {
    throw new APIError(400, "Invalid viedoID");
  }

  return res.status(200).json(
    new APIResponse(200, "Comments for video fetched successfully!", {
      comments: commentsData,
      pages: totalPages,
      count: documentsCount,
    })
  );
});

export {
  addComment,
  updateComment,
  deleteComment,
  getCommentById,
  getVideoComments,
};
