import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    publishVideo, deleteVideo, updateVideo, togglePublishStatus
} from "../controllers/video.controllers.js";
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
]), publishVideo);

router.route("/:videoId/delete").delete(deleteVideo);

router.route("/:videoId/update").patch(upload.single("thumbnail"), updateVideo);

router.route("/:videoId/toggle-status").patch(togglePublishStatus);

export default router;