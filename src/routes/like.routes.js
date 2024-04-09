import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/:commentId/toggle-like").post(toggleCommentLike);

router.route("/:videoId/toggle-like").post(toggleVideoLike);

router.route("/:tweetId/toggle-like").post(toggleTweetLike);

router.route("/liked-videos").get(getLikedVideos);

export default router;