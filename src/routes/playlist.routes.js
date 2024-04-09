import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist
} from "../controllers/playlist.controllers.js"
const router = Router();

router.route("").post(verifyJWT);

router.route("/create-playlist").post(createPlaylist);
router.route("/:userId").get(getUserPlaylists);
router.route("/:userId/:playlistId").get(getPlaylistById);
router.route().patch(updatePlaylist);
router.route().patch(addVideoToPlaylist);
router.route().delete(deletePlaylist);
router.route().patch(removeVideoFromPlaylist);


export default router;