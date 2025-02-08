import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import authControllers from "../controllers/auth.js";
import userControllers from "../controllers/user.js";
import { limiter } from "../utils/rate-limiter.js";
const router = Router();

router.get("/logout", authControllers.logoutUser);
router.get("/get-users", userControllers.getUsers)
router.get("/channel/:username", userControllers.getUserDetails)
router.get("/refresh-tokens", authControllers.refreshTokens);
router.post("/login", authControllers.loginUser);
router.post("/register", limiter(2), authControllers.registerUser);
router.post("/google-login", authControllers.googleSignIn);
router.post("/forget-password", userControllers.forgetPassword);
router.patch('/reset-password', userControllers.resetPassword)
router.use(verifyJWT)
router.get("/is-saved-to-watch-later", userControllers.isSavedToWatchLater)
router.get("/current-user", userControllers.getCurrentUser);
router.get("/watch-history", verifyJWT, userControllers.getWatchHistory)
router.get("/watch-later", verifyJWT, userControllers.getWatchLater)
router.post("/save-to-watch-later", userControllers.saveToWatchLater)
router.post("/add-to-watch-history", userControllers.addToWatchHistory)
router.patch("/remove-from-watch-later", userControllers.removeFromWatchLater)
router.patch("/change-password", userControllers.changeCurrentPassword);
router.patch("/update-account-details", userControllers.updateAccountDetails);
router.delete("/clear-watch-history", userControllers.clearWatchHistory)
router.delete("/remove-from-watch-history", userControllers.removeFromWatchHistory)

export default router;