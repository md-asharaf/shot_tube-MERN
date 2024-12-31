import likeControllers from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);
["comment", "video", "tweet"].forEach((resource) => {
    router.get(`/is-${resource}-liked/:${resource}Id`, likeControllers.isLiked);
});
router.post("/toggle-comment-like/:commentId", likeControllers.toggleCommentLike);
router.post("/toggle-video-like/:videoId", likeControllers.toggleVideoLike);
router.post("/toggle-tweet-like/:tweetId", likeControllers.toggleTweetLike);

export default router;