import { Router } from "express";
import replyController from "../controllers/reply.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.get("/all-replies/:commentId", replyController.getReplies);
router.post("/add-reply/:commentId", verifyJWT, replyController.createReply);
router.patch("/update-reply/:replyId", verifyJWT, replyController.updateReply);
router.delete("/delete-reply/:replyId", verifyJWT, replyController.deleteReply);

export default router;
