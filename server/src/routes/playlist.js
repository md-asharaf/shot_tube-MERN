import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import playlistControllers from "../controllers/playlist.js"
import { limiter } from "../utils/rate-limiter.js";
const router = Router();

router.get("/:playlistId", playlistControllers.getPlaylistById);
router.get("/all-playlists/:userId", verifyJWT, playlistControllers.getUserPlaylists);
router.get("/is-video-saved/:playlistId", playlistControllers.isSavedToPlaylist);
router.post("/create-playlist", limiter(3), verifyJWT, playlistControllers.createPlaylist);
router.patch("/update-playlist/:playlistId", playlistControllers.updatePlaylist);
router.patch("/add-video-to-playlist/:playlistId", playlistControllers.addToPlaylist);
router.patch("/remove-video-from-playlist/:playlistId", playlistControllers.removeFromPlaylist);
router.delete("/delete-playlist/:playlistId", playlistControllers.deletePlaylist);


export default router;