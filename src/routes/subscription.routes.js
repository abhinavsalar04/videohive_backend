import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/subscribers/:channelId").get(getChannelSubscribers);
router.route("/subscribed-channels").get(verifyJWT, getSubscribedChannels);
router
  .route("/toggle-subscription/:channelId")
  .patch(verifyJWT, toggleSubscription);

export { router as subscriptionRouter };
