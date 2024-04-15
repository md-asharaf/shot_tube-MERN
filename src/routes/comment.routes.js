import { CommentC } from "../controllers/comment.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/:videoId").get(CommentC.getAllVideoComments);

router.route("/:videoId/add").post(verifyJWT, CommentC.addComment);

router.route("/:commentId/delete").delete(verifyJWT, CommentC.deleteComment);

router.route("/:commentId/update").patch(verifyJWT, CommentC.updateComment);

export default router;