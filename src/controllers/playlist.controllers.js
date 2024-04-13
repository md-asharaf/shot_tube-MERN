import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PlayList } from "../models/playlist.models.js";

//controller to create a playlist
const createPlaylist = asyncHandler(async (req, res) => {
    //get name and description from request body
    const { name, description } = req.body;
    //get user id from request user object
    const userId = req.user?._id;
    //check if name and description are provided
    if (!name || !description) throw new ApiError(400, "Name and description are required");
    //create playlist
    const playlist = await PlayList.create({
        name,
        description,
        userId
    })
    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist");
    }
    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
})
//controller to get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    //get user id from request params
    const { userId } = req.params;
    //find all playlists of a user
    const playlists = await PlayList.aggregate([
        {
            $match: {
                userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})
//controller to get a playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    //get playlist id from request params
    const { playlistId } = req.params
    /*
        const playlist = await PlayList.findById(playlistId).populate({
            path: "videos",
            populate: {
                path: "userId",
                select: "fullname"
            }
        })
    */
    //aggregate query to get playlist by id
    const playlist = await PlayList.aggregate([
        {
            $match: {
                _id: playlistId,
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
})
//controller to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //get playlist id and video id from request params and body
    const { playlistId } = req.params
    const videoId = req.body.videoId;
    //check if playlistId and videoId are provided
    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistId and videoId are required");
    }
    //add video to playlist
    const playlist = await PlayList.findByIdAndUpdate(playlistId, {
        $push: {
            videos: videoId
        }
    }, {
        new: true
    });
    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
})
//controller to remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //get playlist id and video id from request params
    const { playlistId, videoId } = req.params;
    //check if playlistId and videoId are provided
    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistId and videoId are required");
    }
    //find playlist by id
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    //check if video exists in playlist
    const video = await playlist.videos.find(v => v == videoId);
    if (!video) {
        throw new ApiError(404, "Video not found in playlist");
    }
    //remove video from playlist
    const updatedPlaylist = await PlayList.findByIdAndUpdate(playlist._id, {
        $pull: {
            videos: videoId
        },
    }, {
        new: true
    });
    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
})
//controller to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    //get playlist id from request params
    const { playlistId } = req.params;
    //find playlist by id
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    //delete playlist
    const isDeleted = await PlayList.findByIdAndDelete(playlist._id);
    if (!isDeleted) {
        throw new ApiError(500, "Failed to delete playlist");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
})
// controller to update the name or description or both of a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    //get playlist id from request params and name and description from request body
    const { playlistId } = req.params
    const { name, description } = req.body
    //check if name or description is provided
    if (!name && !description) {
        throw new ApiError(400, "Name or description is required");
    }
    //find playlist by id and update
    const playlist = await PlayList.findByIdAndUpdate(playlistId, {
        $set: {
            name,
            description
        }
    }, {
        new: true
    });
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})


export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist }