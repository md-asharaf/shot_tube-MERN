import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { VideoC } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

router.use(verifyJWT);

router.route("/publish").post(upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), VideoC.publishVideo);

router.route("/:videoId/delete").delete(VideoC.deleteVideo);

router.route("/:videoId/update").patch(upload.single("thumbnail"), VideoC.updateVideo);

router.route("/:videoId/toggle-status").patch(VideoC.togglePublishStatus);

export default router;