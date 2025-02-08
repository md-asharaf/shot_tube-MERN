import { Router } from "express";
import replyController from "../controllers/reply.js";
import { verifyJWT } from "../middlewares/auth.js";
import { limiter } from "../utils/rate-limiter.js";

const router = Router();

router.get("/all-replies/:commentId", replyController.getReplies);
router.post("/add-reply/:commentId", limiter(10), verifyJWT, replyController.createReply);
router.use(verifyJWT);
router.patch("/update-reply/:replyId", replyController.updateReply);
router.delete("/delete-reply/:replyId", replyController.deleteReply);

export default router;
