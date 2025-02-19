
import { Router } from "express";
import { webhookController } from "../controllers/webhook.js";
const router = Router();

router.patch("/transcoding-status", webhookController.updateTranscriptionStatus);
router.patch("/transcription-status", webhookController.updateTranscriptionStatus);
router.patch("/title-and-desc-status", webhookController.updateTitleAndDescStatus);

export const webhookRoutes = router;