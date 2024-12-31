import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { detectEmotion } from "../middlewares/sentiment.middlewares.js";
import commentControllers from "../controllers/comment.controllers.js"
const router = Router();

router.get("/all-comments/:videoId", commentControllers.getAllVideoComments);
router.post("/add-comment/:videoId", verifyJWT, detectEmotion, commentControllers.addComment);
router.patch("/update-comment/:commentId", verifyJWT, commentControllers.updateComment);
router.delete("/delete-comment/:commentId", verifyJWT, commentControllers.deleteComment);

export default router;