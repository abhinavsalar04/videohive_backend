import Router from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// for multiple file fields lile avatar & coverImage we can not use Array as it only accepts multiple files associated with same field name
// so we use upload.fields() instead of upload.array()
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export { router as userRouter };
