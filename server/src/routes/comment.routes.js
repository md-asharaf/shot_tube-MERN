import CommentC from "../controllers/comment.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { detectEmotion } from "../middlewares/sentiment.middlewares.js";
const router = Router();

router.get("/all-comments/:videoId", CommentC.getAllVideoComments);
router.post("/add-comment/:videoId", verifyJWT, detectEmotion, CommentC.addComment);
router.patch("/update-comment/:commentId", verifyJWT, CommentC.updateComment);
router.delete("/delete-comment/:commentId", verifyJWT, CommentC.deleteComment);

export default router;