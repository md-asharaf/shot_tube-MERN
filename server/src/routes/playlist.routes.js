import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import PlayListC from "../controllers/playlist.controllers.js"
const router = Router();

router.get("/:userId/all-playlists", PlayListC.getUserPlaylists);
router.get("/:playlistId", PlayListC.getPlaylistById);
router.post("/create", verifyJWT, PlayListC.createPlaylist);
router.patch("/:playlistId/update", verifyJWT, PlayListC.updatePlaylist);
router.patch("/:playlistId/:videoId/add", verifyJWT, PlayListC.addVideoToPlaylist);
router.delete("/:playlistId/delete", verifyJWT, PlayListC.deletePlaylist);
router.patch("/:playlistId/:videoId/remove", verifyJWT, PlayListC.removeVideoFromPlaylist);


export default router;