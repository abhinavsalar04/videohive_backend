import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // extended: true - supports nested objects in url
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

// routes imports
import { userRouter } from "./routes/user.routes.js";
import { tweetRouter } from "./routes/tweet.routes.js";
import { videoRouter } from "./routes/video.routes.js";
import { playlistRouter } from "./routes/playlist.routes.js";
import {commentRouter} from "./routes/comment.routes.js"

// as the separate userRouter so we can create routes like app.get("/", controller) here
//  we need to use router as middleware
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);


export default app;
