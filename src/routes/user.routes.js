import Router from "express";
import {
  changeCurrentPassword,
  getActiveUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/active-user").get(verifyJWT, getActiveUser);
router.route("/update-user").patch(verifyJWT, updateUser); // patch to update a piece of data

export { router as userRouter };
