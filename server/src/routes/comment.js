import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { detectEmotion } from "../middlewares/sentiment.js";
import commentControllers from "../controllers/comment.js"
import { limiter } from "../utils/rate-limiter.js";
const router = Router();
router.get("/comments-count", commentControllers.commentsCount)
router.get("/all-video-comments/:videoId", commentControllers.getAllVideoComments);
router.get("/all-short-comments/:shortId", commentControllers.getAllShortComments);
router.post("/add-comment-to-video/:videoId", limiter(10), verifyJWT, detectEmotion, commentControllers.addCommentToVideo);
router.post("/add-comment-to-short/:shortId", limiter(10), verifyJWT, detectEmotion, commentControllers.addCommentToShort);
router.patch("/update-comment/:commentId", verifyJWT, commentControllers.updateComment);
router.delete("/delete-comment/:commentId", verifyJWT, commentControllers.deleteComment);

export default router;