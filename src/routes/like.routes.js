import { LikeC } from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/:commentId/toggle-comment").post(LikeC.toggleCommentLike);

router.route("/:videoId/toggle-video").post(LikeC.toggleVideoLike);

router.route("/:tweetId/toggle-tweet").post(LikeC.toggleTweetLike);

router.route("/liked-videos").get(LikeC.getLikedVideos);

export default router;