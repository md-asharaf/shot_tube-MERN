import { Router } from "express";
import { studioController } from "../controllers/studio.js";
const router = Router();

router.get("/posts/:username", studioController.getUserPosts);
router.get("/videos/:username", studioController.getUserVideos);
router.get("/playlists/:username", studioController.getUserPlaylists);
router.get("/shorts/:username", studioController.getUserShorts);

export const studioRoutes = router;
