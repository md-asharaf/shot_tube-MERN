import likeControllers from "../controllers/like.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.use(verifyJWT);
router.get("/likes-count",likeControllers.likesCount)
router.get(`/is-liked`, likeControllers.isLiked);
router.post("/toggle-comment-like/:commentId", likeControllers.toggleCommentLike);
router.post("/toggle-short-like/:shortId", likeControllers.toggleShortLike);
router.post("/toggle-video-like/:videoId", likeControllers.toggleVideoLike);
router.post("/toggle-tweet-like/:tweetId", likeControllers.toggleTweetLike);
router.post("/toggle-reply-like/:replyId", likeControllers.toggleReplyLike);
router.get('/video-comments-like/:videoId',likeControllers.videoCommentsLike);
router.get('/short-comments-like/:shortId',likeControllers.shortCommentsLike);
router.get('/comment-replies-like/:commentId',likeControllers.commentRepliesLike);
export default router;