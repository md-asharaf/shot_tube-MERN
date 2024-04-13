import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist
} from "../controllers/playlist.controllers.js"
const router = Router();

router.route("/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/create").post(verifyJWT, createPlaylist);
router.route("/:playlistId/update").patch(verifyJWT, updatePlaylist);
router.route("/:playlistId/add-video").patch(verifyJWT, addVideoToPlaylist);
router.route("/:playlistId/delete").delete(verifyJWT, deletePlaylist);
router.route("/:playlistId/:videoId/remove").patch(verifyJWT, removeVideoFromPlaylist);


export default router;