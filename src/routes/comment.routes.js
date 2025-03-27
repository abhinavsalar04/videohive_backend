import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getCommentById,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment);
router
  .route("/comment/:commentId")
  .get(getCommentById)
  .put(updateComment)
  .delete(deleteComment);

export { router as commentRouter };
