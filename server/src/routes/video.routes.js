import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import VideoC from "../controllers/video.controllers.js";
const router = Router();

router.get("/all-videos", VideoC.getAllVideos);
router.get("/search-videos", VideoC.getVideosByQuery);
router.get("/:videoId", VideoC.getSingleVideo);
router.get("/recommended-videos/:videoId", verifyJWT,VideoC.getRecommendedVideos);
router.get("/user-videos/:userId", VideoC.getUserVideos);
router.post("/publish-video", verifyJWT, VideoC.publishVideo);
router.post("/increase-views/:videoId", VideoC.increaseViews)
router.delete("/delete-video/:videoId", verifyJWT, VideoC.deleteVideo);
router.patch("/update-video/:videoId", verifyJWT, VideoC.updateVideo);
router.patch("/toggle-status/:videoId", verifyJWT, VideoC.togglePublishStatus);

export default router;