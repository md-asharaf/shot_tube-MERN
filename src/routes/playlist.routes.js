import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist
} from "../controllers/playlist.controllers.js"
const router = Router();

router.use(verifyJWT);

router.route("/create").post(createPlaylist);
router.route("/:userId").get(getUserPlaylists);
router.route("/:userId/:playlistId").get(getPlaylistById);
router.route("/:playlistId/update").patch(updatePlaylist);
router.route("/:playlistId/add-video").patch(addVideoToPlaylist);
router.route("/:playlistId/delete").delete(deletePlaylist);
router.route("/:playlistId/remove-video").patch(removeVideoFromPlaylist);


export default router;