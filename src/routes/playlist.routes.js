import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoInPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getPlaylists).post(createPlaylist);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router
  .route("/:playlistId/:videoId")
  .patch(addVideoInPlaylist)
  .delete(removeVideoFromPlaylist);

export { router as playlistRouter };
