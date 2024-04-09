import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("").post(verifyJWT);

router.route("/:commentId/toggle-like").post(toggleCommentLike);

router.route("/:videoId/add-comment").post(toggleVideoLike);

router.route("/:tweetId/delete-comment").post(toggleTweetLike);

router.route("/liked-videos").get(getLikedVideos);

export default router;