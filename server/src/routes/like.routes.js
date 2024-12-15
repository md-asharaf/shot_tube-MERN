import LikeC from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);
router.route("/liked-videos").get(LikeC.getLikedVideos);
["comment", "video", "tweet"].forEach((resource) => {
    router.get(`/is-${resource}-liked/:${resource}Id`, LikeC.isLiked);
});
router.post("/toggle-comment-like/:commentId", LikeC.toggleCommentLike);
router.post("/toggle-video-like/:videoId", LikeC.toggleVideoLike);
router.post("/toggle-tweet-like/:tweetId", LikeC.toggleTweetLike);

export default router;