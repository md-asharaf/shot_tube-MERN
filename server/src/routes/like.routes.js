import LikeC from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.post("/:commentId/toggle-comment-like", LikeC.toggleCommentLike);

router.post("/:videoId/toggle-video-like", LikeC.toggleVideoLike);

router.post("/:tweetId/toggle-tweet-like", LikeC.toggleTweetLike);

router.route("/liked-videos").get(LikeC.getLikedVideos);
["comment", "video", "tweet"].forEach((resource) => {
    router.get(`/:${resource}Id/is-${resource}-liked`, LikeC.isLiked);
});


export default router;