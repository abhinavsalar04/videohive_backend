import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(getLikedVideos);
router.route("/video/:videoId").put(toggleVideoLike);
router.route("/tweet/:tweetId").put(toggleTweetLike);
router.route("/comment/:commentId").put(toggleCommentLike);

export { router as likeRouter };
