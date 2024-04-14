import { registerUser, loginUser, logoutUser, refreshAcessToken, updateAvatar, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateCoverImage, getUserProfileDetails, getWatchHistory } from "../controllers/user.controllers.js"
import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAcessToken);

router.route("/account/change-password").patch(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/account/update").patch(verifyJWT, updateAccountDetails);

router.route("/account/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

router.route("/account/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:username").get(getUserProfileDetails)

router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router;