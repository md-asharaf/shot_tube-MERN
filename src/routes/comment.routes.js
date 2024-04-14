import { addComment, deleteComment, getAllVideoComments, updateComment } from "../controllers/comment.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/:videoId").get(getAllVideoComments);

router.route("/:videoId/add").post(verifyJWT, addComment);

router.route("/:commentId/delete").delete(verifyJWT, deleteComment);

router.route("/:commentId/update").patch(verifyJWT, updateComment);

export default router;