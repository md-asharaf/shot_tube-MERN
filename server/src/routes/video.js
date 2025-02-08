import Router from "express";
import { verifyJWT } from "../middlewares/auth.js";
import videoControllers from "../controllers/video.js";
const router = Router();

router.get("/search-videos", videoControllers.getVideosByQuery);
router.get("/recommended-videos", videoControllers.getRecommendedVideos);
router.get("/user-videos/:userId", videoControllers.getVideosByUserId);
router.get("/liked-videos",verifyJWT, videoControllers.getLikedVideos);
router.get("/:videoId", videoControllers.getVideoById);
router.post("/increase-views/:videoId", videoControllers.increaseViews)
router.use(verifyJWT);
router.post("/publish-video", videoControllers.publishVideo);
router.delete("/delete-video/:videoId", videoControllers.deleteVideo);
router.patch("/update-video/:videoId", videoControllers.updateVideoDetails);

export default router;