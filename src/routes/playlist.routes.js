import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { PlayListC } from "../controllers/playlist.controllers.js"
const router = Router();

router.route("/:userId/all-playlists").get(PlayListC.getUserPlaylists);
router.route("/:playlistId").get(PlayListC.getPlaylistById);
router.route("/create").post(verifyJWT, PlayListC.createPlaylist);
router.route("/:playlistId/update").patch(verifyJWT, PlayListC.updatePlaylist);
router.route("/:playlistId/:videoId/add").patch(verifyJWT, PlayListC.addVideoToPlaylist);
router.route("/:playlistId/delete").delete(verifyJWT, PlayListC.deletePlaylist);
router.route("/:playlistId/:videoId/remove").patch(verifyJWT, PlayListC.removeVideoFromPlaylist);


export default router;