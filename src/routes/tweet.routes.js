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
router.route("/:tweetId").get(getTweet);
router.route("/").get(getUserTweets);
router.route("/update/:tweetId").patch(updateTweet);
router.route("/delete/:tweetId").delete(deleteTweet);

export {router as tweetRouter}
