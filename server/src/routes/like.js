import likeControllers from "../controllers/like.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.get("/likes-count",likeControllers.likesCount)
router.get('/video-comments-likes-count/:videoId',likeControllers.videoCommentsLikeCount);
router.get('/short-comments-likes-count/:shortId',likeControllers.shortCommentsLikeCount);
router.get('/comment-replies-likes-count/:commentId',likeControllers.commentRepliesLikeCount);

router.use(verifyJWT);
router.get(`/is-liked`, likeControllers.isLiked);
router.post("/toggle-comment-like/:commentId", likeControllers.toggleCommentLike);
router.post("/toggle-short-like/:shortId", likeControllers.toggleShortLike);
router.post("/toggle-video-like/:videoId", likeControllers.toggleVideoLike);
router.post("/toggle-tweet-like/:tweetId", likeControllers.toggleTweetLike);
router.post("/toggle-reply-like/:replyId", likeControllers.toggleReplyLike);
router.get('/video-comments-like-status/:videoId',likeControllers.likedStatusofVideoComments);
router.get('/short-comments-like-status/:shortId',likeControllers.likedStatusofShortComments);
router.get('/comment-replies-like-status/:commentId',likeControllers.likedStatusofCommentReplies);

export default router;