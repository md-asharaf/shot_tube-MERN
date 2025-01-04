import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import playlistControllers from "../controllers/playlist.js"
const router = Router();

router.get("/:playlistId", playlistControllers.getPlaylistById);
router.get("/all-playlists/:userId",verifyJWT, playlistControllers.getUserPlaylists);
router.get("/is-video-saved/:videoId/:playlistId",playlistControllers.isSavedToPlaylist);
router.post("/create-playlist", verifyJWT, playlistControllers.createPlaylist);
router.patch("/update-playlist/:playlistId", playlistControllers.updatePlaylist);
router.patch("/add-video-to-playlist/:playlistId/:videoId", playlistControllers.addVideoToPlaylist);
router.patch("/remove-video-from-playlist/:playlistId/:videoId", playlistControllers.removeVideoFromPlaylist);
router.delete("/delete-playlist/:playlistId", playlistControllers.deletePlaylist);


export default router;