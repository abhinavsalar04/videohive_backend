import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").get(getTweet).patch(updateTweet).delete(deleteTweet);

export { router as tweetRouter };
