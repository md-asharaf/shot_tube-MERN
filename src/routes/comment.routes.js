import { addComment, deleteComment, getAllVideoComments, updateComment } from "../controllers/comment.controllers.js"
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getAllVideoComments);

router.route("/:videoId/add").post(addComment);

router.route("/:commentId/delete").delete(deleteComment);

router.route("/:commentId/update").patch(updateComment);

export default router;