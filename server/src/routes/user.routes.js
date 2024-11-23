import UserC from "../controllers/user.controllers.js"
import Auth from "../controllers/auth.controllers.js"
import { Router } from "express";
import { multerUpload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.post("/register", Auth.registerUser);
router.post("/google-login", Auth.googleSignIn);
router.post("/login", Auth.loginUser);
router.post("/watch-history/:videoId/add", verifyJWT, UserC.addVideoToWatchHistory)
router.get("/logout", Auth.logoutUser);

router.get("/current-user", verifyJWT, UserC.getCurrentUser);
router.get("/channel/:username", UserC.getUserDetails)

router.get("/watch-history", verifyJWT, UserC.getWatchHistory)

router.patch("/account/change-password", verifyJWT, UserC.changeCurrentPassword);


router.patch("/account/update", verifyJWT, UserC.updateAccountDetails);

router.patch("/update-avatar", verifyJWT, multerUpload.single("avatar"), UserC.updateAvatar);

router.patch("/update-cover-image", verifyJWT, multerUpload.single("coverImage"), UserC.updateCoverImage);
router.delete("/watch-history/clear", verifyJWT, verifyJWT, UserC.clearWatchHistory)


export default router;