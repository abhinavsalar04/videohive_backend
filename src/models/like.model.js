import mongoose, { mongo } from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"]
    },
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video",
    },
    comment: {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
    },
    tweet: {
        type: mongoose.Types.ObjectId,
        ref: "Tweet",
    }

  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
