import CommentC from "../controllers/comment.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/:videoId", CommentC.getAllVideoComments);

router.post("/:videoId/add", verifyJWT, CommentC.addComment);

router.delete("/:commentId/delete", verifyJWT, CommentC.deleteComment);

router.patch("/:commentId/update", verifyJWT, CommentC.updateComment);

export default router;