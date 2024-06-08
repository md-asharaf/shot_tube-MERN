import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import VideoC from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();


router.get("/", VideoC.getAllVideos);
router.get("/:videoId", VideoC.getSingleVideo);

router.post("/publish", verifyJWT, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), VideoC.publishVideo);
router.get("/:userId/videos", VideoC.getUserVideos);

router.delete("/:videoId/delete", verifyJWT, VideoC.deleteVideo);

router.patch("/:videoId/update", verifyJWT, upload.single("thumbnail"), VideoC.updateVideo);

router.patch("/:videoId/toggle-status", verifyJWT, VideoC.togglePublishStatus);

export default router;