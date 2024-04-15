import { UserC, Auth } from "../controllers/user.controllers.js"
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
    Auth.registerUser
)

router.route("/login").post(Auth.loginUser);

router.route("/logout").post(verifyJWT, Auth.logoutUser);

router.route("/refresh-token").post(Auth.refreshAcessToken);

router.route("/account/change-password").patch(verifyJWT, UserC.changeCurrentPassword);

router.route("/current-user").get(verifyJWT, UserC.getCurrentUser);

router.route("/account/update").patch(verifyJWT, UserC.updateAccountDetails);

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), UserC.updateAvatar);

router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), UserC.updateCoverImage);

router.route("/channel/:username").get(verifyJWT, UserC.getUserProfileDetails)

router.route("/watch-history").get(verifyJWT, UserC.getWatchHistory)

export default router;