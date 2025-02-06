import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import authControllers from "../controllers/auth.js";
import userControllers from "../controllers/user.js";
import { limiter } from "../utils/rate-limiter.js";
const router = Router();

router.get("/logout", authControllers.logoutUser);
router.get("/get-users",userControllers.getUsers)
router.get("/current-user", verifyJWT, userControllers.getCurrentUser);
router.get("/watch-history",verifyJWT, userControllers.getWatchHistory)
router.get("/watch-later",verifyJWT, userControllers.getWatchLater)
router.get("/channel/:username", userControllers.getUserDetails)
router.get("/is-saved-to-watch-later", verifyJWT, userControllers.isSavedToWatchLater)
router.get("/refresh-tokens", authControllers.refreshTokens);
router.post("/login", authControllers.loginUser);
router.post("/register", limiter(2),authControllers.registerUser);
router.post("/google-login", authControllers.googleSignIn);
router.post("/forget-password", userControllers.forgetPassword);
router.post("/save-to-watch-later", verifyJWT, userControllers.saveToWatchLater)
router.post("/add-to-watch-history", verifyJWT, userControllers.addToWatchHistory)
router.patch("/remove-from-watch-later", verifyJWT, userControllers.removeFromWatchLater)
router.patch("/change-password", verifyJWT, userControllers.changeCurrentPassword);
router.patch('/reset-password',userControllers.resetPassword)
router.patch("/update-account-details", verifyJWT, userControllers.updateAccountDetails);
router.delete("/clear-watch-history", verifyJWT, userControllers.clearWatchHistory)
router.delete("/remove-from-watch-history", verifyJWT, userControllers.removeFromWatchHistory)

export default router;