import mongoose, { Schema } from "mongoose";
const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: [true, "Videos is required"],
      },
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
