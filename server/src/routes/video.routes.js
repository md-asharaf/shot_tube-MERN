import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import VideoC from "../controllers/video.controllers.js";
const router = Router();

router.get("/", VideoC.getAllVideos);
router.get("/:videoId/recommended", verifyJWT,VideoC.getRecommendedVideos);
router.get("/:videoId", VideoC.getSingleVideo);
router.get("/search/:query", VideoC.getVideosByQuery);
router.post("/publish", verifyJWT, VideoC.publishVideo);
router.post("/:videoId/increase", VideoC.increaseViews)
router.get("/:userId/videos", VideoC.getUserVideos);

router.delete("/:videoId/delete", verifyJWT, VideoC.deleteVideo);

router.patch("/:videoId/update", verifyJWT, VideoC.updateVideo);

router.patch("/:videoId/toggle-status", verifyJWT, VideoC.togglePublishStatus);

export default router;