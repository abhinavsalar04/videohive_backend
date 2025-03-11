import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    video: {
      type: mongoose.Types?.ObjectId,
      ref: "Video",
      required: [true, "Video is required"],
    },
    content: {
      type: String,
      required: [true, "Comment Description is required"],
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
