import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import PlayListC from "../controllers/playlist.controllers.js"
const router = Router();

router.get("/:playlistId", PlayListC.getPlaylistById);
router.get("/:userId/all-playlists", PlayListC.getUserPlaylists);
router.post("/create", verifyJWT, PlayListC.createPlaylist);
router.patch("/:playlistId/update", verifyJWT, PlayListC.updatePlaylist);
router.patch("/:playlistId/:videoId/add", verifyJWT, PlayListC.addVideoToPlaylist);
router.patch("/:playlistId/:videoId/remove", verifyJWT, PlayListC.removeVideoFromPlaylist);
router.delete("/:playlistId/delete", verifyJWT, PlayListC.deletePlaylist);


export default router;