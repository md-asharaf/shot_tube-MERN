import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import PlayList from "../models/playlist.models.js";

//controller to create a playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

})
//controller to get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
})
//controller to get a playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
})
//controller to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
})
//controller to remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

})
//controller to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
})
// controller to update the name or description or both of a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
})


export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist }