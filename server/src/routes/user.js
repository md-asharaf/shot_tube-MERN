import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import authControllers from "../controllers/auth.js";
import userControllers from "../controllers/user.js";
const router = Router();

router.get("/logout", authControllers.logoutUser);
router.get("/get-users",userControllers.getUsers)
router.get("/current-user", verifyJWT, userControllers.getCurrentUser);
router.get("/watch-history", verifyJWT, userControllers.getWatchHistory)
router.get("/watch-later", verifyJWT, userControllers.getWatchLater)
router.get("/channel/:username", userControllers.getUserDetails)
router.get("/watch-later", verifyJWT, userControllers.getWatchLater)
router.get("/is-saved-to-watch-later/:videoId", verifyJWT, userControllers.isSavedToWatchLater)
router.post("/login", authControllers.loginUser);
router.post("/register", authControllers.registerUser);
router.post("/google-login", authControllers.googleSignIn);
router.post("/forget-password", userControllers.forgetPassword);
router.post("/save-to-watch-later/:videoId", verifyJWT, userControllers.saveVideoToWatchLater)
router.post("/add-to-watch-history/:videoId", verifyJWT, userControllers.addVideoToWatchHistory)
router.patch("/remove-from-watch-later/:videoId", verifyJWT, userControllers.removeVideoFromWatchLater)
router.patch("/change-password", verifyJWT, userControllers.changeCurrentPassword);
router.patch('/reset-password',userControllers.resetPassword)
router.patch("/update-account-details", verifyJWT, userControllers.updateAccountDetails);
router.delete("/clear-watch-history", verifyJWT, userControllers.clearWatchHistory)
router.delete("/remove-from-watch-history/:videoId", verifyJWT, userControllers.removeVideoFromWatchHistory)



export default router;