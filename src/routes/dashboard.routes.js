import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideosUploadedByChannel, getChannelStats } from "../controllers/dashboard.controller";

const router = Router()

router.use(verifyJWT)

router.route("/channel-stats/:channelId").get(getChannelStats)
router.route("/channel-videos").get(getAllVideosUploadedByChannel)

export {router as dashboardRouter}