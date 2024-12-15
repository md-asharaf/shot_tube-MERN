import UserC from "../controllers/user.controllers.js"
import Auth from "../controllers/auth.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.get("/logout", Auth.logoutUser);
router.get("/get-users",UserC.getUsers)
router.get("/current-user", verifyJWT, UserC.getCurrentUser);
router.get("/watch-history", verifyJWT, UserC.getWatchHistory)
router.get("/channel/:username", UserC.getUserDetails)
router.post("/login", Auth.loginUser);
router.post("/register", Auth.registerUser);
router.post("/google-login", Auth.googleSignIn);
router.post("/forget-password", UserC.forgetPassword);
router.post("/add-to-watch-history/:videoId", verifyJWT, UserC.addVideoToWatchHistory)
router.patch("/change-password", verifyJWT, UserC.changeCurrentPassword);
router.patch('/reset-password',UserC.resetPassword)
router.patch("/update-account-details", verifyJWT, UserC.updateAccountDetails);
router.delete("/clear-watch-history", verifyJWT, UserC.clearWatchHistory)
router.delete("/remove-from-watch-history/:videoId", verifyJWT, UserC.removeVideoFromWatchHistory)


export default router;