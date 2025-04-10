import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
  updateVideoVisiblity,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/list/:userId").get(getAllVideos);
router.route("/publish").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);
router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideo)
  .delete(deleteVideo);

router.route("/toggle-publish/:videoId").patch(togglePublishStatus);
router.route("/visibility/:videoId").patch(updateVideoVisiblity);

export { router as videoRouter }
