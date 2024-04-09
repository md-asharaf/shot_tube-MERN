import { addComment, deleteComment, getAllVideoComments, updateComment } from "../controllers/comment.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("").post(verifyJWT);

router.route("/:videoId/comments").get(getAllVideoComments);

router.route("/:videoId/add-comment").post(addComment);

router.route("/:commentId/delete-comment").delete(deleteComment);

router.route("/:commentId/update-comment").patch(updateComment);

export default router;