import { APIError } from "../utils/APIError";
import { APIResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const {
    _id: owner,
    fullName,
    username,
    email,
    avatar,
    coverImage,
  } = req.user;

  if (!title) {
    throw new APIError(400, "Title is required!");
  }

  const isPlaylistExists = await Playlist.findOne({ title: title });
  if (isPlaylistExists) {
    throw new APIError(400, "Playlist already exists!");
  }

  const createdPlaylist = await Playlist.create({
    title,
    description,
    owner,
    video: [],
  });

  // mongo db create query either returns doc on successfull or throws error so the below case will never arises.
  // if (!createdPlaylist) {
  //   throw new APIError(
  //     500,
  //     "Server error! Unable to create playlist. Please try again later"
  //   );
  // }

  const createdPlaylistObject = {
    ...createdPlaylist.toObject(), // by default the mongodb document is not equivalent to object and contains so many fields other the schema
    owner: {
      _id: owner,
      fullName,
      username,
      email,
      avatar,
      coverImage,
    },
  };

  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        "Playlist created successfully!",
        createdPlaylistObject
      )
    );
});

const getPlaylists = asyncHandler(async (req, res) => {
  const { _id: owner } = req.user;
  if (!owner) {
    throw new APIError(403, "Unauthorized access!");
  }

  const playlists = await Playlist.find({ owner: owner }).select("-owner");

  if (!playlists) {
    throw new APIError(500, "Server error! Unable to get the playlists!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Playlists fetched successfully!", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { _id: owner } = req.user;

  if (!playlistId) {
    throw new APIError(400, "Playlist Id is required!");
  }

  // const playlist = await Playlist.findById(playlistId);
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "owner",
          //     foreignField: "_id",
          //     as: "owner",
          //     pipeline: [
          //       {
          //         $project: {
          //           username: 1,
          //           fullName: 1,
          //           email: 1,
          //           avatar: 1,
          //           coverImage: 1,
          //         },
          //       },
          //     ],
          //   },
          // },
          // {
          //   $addFields: {
          //     owner: {
          //       $first: "$owner",
          //     },
          //   },
          // },
          // {
          //   $project: {
          //     owner: 0,
          //   },
          // },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              email: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!playlist) {
    throw new APIError(400, "Invalid playlist Id!");
  }

  console.log(playlist);

  return res
    .status(200)
    .json(new APIResponse(200, "Playlist fetched successfully!", playlist[0]));
});

const addVideoInPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  const {
    _id: owner,
    fullName,
    email,
    username,
    avatar,
    coverImage,
  } = req.user;

  if (!videoId || !playlistId) {
    throw new APIError(400, "Playlist Id or videoId is missing!");
  }

  // const updatedPlaylist = await Playlist.findByIdAndUpdate(
  //   playlistId,
  //   {
  //     $push: { videos: videoId },
  //   },
  //   { new: true }
  // );

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new APIError(400, "Invalid playlist Id");
  }

  if (playlist?.videos?.includes(videoId)) {
    throw new APIError(400, "Video already exists in the playlist!");
  }

  playlist.videos.push(videoId);
  let updatedPlaylist = await playlist.save({ validateBeforeSave: true });
  console.log({ updatedPlaylist });
  updatedPlaylist = {
    ...updatedPlaylist.toObject(),
    owner: {
      _id: owner,
      fullName,
      username,
      email,
      avatar,
      coverImage,
    },
  };

  if (!updatedPlaylist) {
    throw new APIError(400, "Invalid playlist Id");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Video added to playlist", updatedPlaylist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!videoId || !playlistId) {
    throw new APIError(400, "Playlist Id or videoId is missing!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new APIError(400, "Invalid playlist Id");
  }

  if (!playlist?.videos?.includes(videoId)) {
    throw new APIError(400, "Video does not exists in the playlist!");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new APIError(
      500,
      "Server error! Unable to remove video from playlist"
    );
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Video removed from playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { playlistId } = req.params;

  if (!title && !description) {
    throw new APIError(400, "Title or description is missing");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        title,
        description,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new APIError(400, "Playlist does not found!");
  }

  return res
    .status(200)
    .json(
      new APIResponse(200, "Playlist updated successfully!", updatedPlaylist)
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new APIError(400, "Playlist Id is missing!");
  }

  const updatedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!updatedPlaylist) {
    throw new APIError(400, "Playlist does not exists!");
  }

  return res
    .status(200)
    .json(new APIResponse(200, "Playlist deleted successfully!"));
});

export {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
  addVideoInPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
