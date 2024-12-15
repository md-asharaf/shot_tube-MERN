import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import PlayListC from "../controllers/playlist.controllers.js"
const router = Router();

router.get("/:playlistId", PlayListC.getPlaylistById);
router.get("/all-playlists/:userId", PlayListC.getUserPlaylists);
router.post("/create-playlist", verifyJWT, PlayListC.createPlaylist);
router.patch("/update-playlist/:playlistId", verifyJWT, PlayListC.updatePlaylist);
router.patch("/add-video-to-playlist/:playlistId/:videoId", verifyJWT, PlayListC.addVideoToPlaylist);
router.patch("/remove-video-from-playlist/:playlistId/:videoId", verifyJWT, PlayListC.removeVideoFromPlaylist);
router.delete("/delete-playlist/:playlistId", verifyJWT, PlayListC.deletePlaylist);


export default router;