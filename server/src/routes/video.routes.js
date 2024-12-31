import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import videoControllers from "../controllers/video.controllers.js";
const router = Router();

router.get("/all-videos", videoControllers.getAllVideos);
router.get("/search-videos", videoControllers.getVideosByQuery);
router.get("/recommended-videos/:videoId", verifyJWT, videoControllers.getRecommendedVideos);
router.get("/user-videos/:userId", videoControllers.getUserVideos);
router.get("/liked-videos", verifyJWT, videoControllers.getLikedVideos);
router.get("/:videoId", videoControllers.getSingleVideo);
router.post("/publish-video", verifyJWT, videoControllers.publishVideo);
router.post("/increase-views/:videoId", videoControllers.increaseViews)
router.delete("/delete-video/:videoId", verifyJWT, videoControllers.deleteVideo);
router.patch("/update-video/:videoId", verifyJWT, videoControllers.updateVideoDetails);
router.patch("/toggle-status/:videoId", verifyJWT, videoControllers.togglePublishStatus);

export default router;