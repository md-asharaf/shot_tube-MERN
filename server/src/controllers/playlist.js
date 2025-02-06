import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PlayList } from "../models/playlist.js";
import mongoose from "mongoose";

class PlaylistController {
    createPlaylist = asyncHandler(async (req, res) => {
        const { name, description } = req.body;
        const userId = req.user?._id;
        if (!name) {
            throw new ApiError(400, "Name is required")
        }
        const playlist = await PlayList.create({
            name,
            description,
            userId
        })
        if (!playlist) {
            throw new ApiError(500, "Failed to create playlist");
        }
        return res.status(201).json(new ApiResponse(201, null, "Playlist created successfully"));
    })
    isSavedToPlaylist = asyncHandler(async (req, res) => {
        const { playlistId } = req.params;
        const { videoId, shortId } = req.query;
        if (!playlistId) {
            throw new ApiError(400, "PlaylistId is required");
        }
        if (!videoId && !shortId) {
            throw new ApiError(400, "VideoId or shortId is required");
        }
        const playlist = await PlayList.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        const isSaved = videoId ? playlist.videos.includes(videoId) : playlist.shorts.includes(shortId);
        return res.status(200).json(new ApiResponse(200, { isSaved }, "Video is saved to playlist"));
    })
    getUserPlaylists = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
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
                                as: "creator",
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
                                creator: {
                                    $first: "$creator"
                                }
                            }
                        },
                        {
                            $project: {
                                userId: 0
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator",
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
                    creator: {
                        $first: "$creator"
                    }
                }
            },
            {
                $project: {
                    userId: 0
                }
            }
        ])
        return res.status(200).json(new ApiResponse(200, { playlists }, "Playlists fetched successfully"))
    })
    getPlaylistById = asyncHandler(async (req, res) => {
        const { playlistId } = req.params
        if (!playlistId) {
            throw new ApiError(400, "PlaylistId is required")
        }
        const playlists = await PlayList.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(playlistId),
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
                                as: "creator",
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
                                creator: {
                                    $first: "$creator"
                                }
                            }
                        },
                        {
                            $project: {
                                userId: 0
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator",
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
                    creator: {
                        $first: "$creator"
                    }
                }
            },
            {
                $project: {
                    userId: 0
                }
            }
        ]);
        if (!playlists) {
            throw new ApiError(404, "Playlist not found")
        }
        return res.status(200).json(new ApiResponse(200, { playlist: playlists[0] }, "Playlist fetched successfully"));
    })
    addToPlaylist = asyncHandler(async (req, res) => {
        const { playlistId } = req.params;
        const { videoId, shortId } = req.query;
        if (!playlistId) {
            throw new ApiError(400, "PlaylistId is required");
        }
        if (!videoId && !shortId) {
            throw new ApiError(400, "VideoId or shortId is required");
        }
        const updateQuery = videoId ? { videos: new mongoose.Types.ObjectId(videoId) } : { shorts: new mongoose.Types.ObjectId(shortId) };
        const playlist = await PlayList.findByIdAndUpdate(playlistId, {

            $push: updateQuery
        }, {
            new: true
        });
        if (!playlist) {
            throw new ApiError(500, "Failed to add video to playlist");
        }
        return res.status(200).json(new ApiResponse(200, null, "added to playlist successfully"));
    })
    removeFromPlaylist = asyncHandler(async (req, res) => {
        const { playlistId } = req.params;
        const { videoId, shortId } = req.query;
        if (!playlistId) {
            throw new ApiError(400, "PlaylistId is required");
        }
        if (!videoId && !shortId) {
            throw new ApiError(400, "VideoId or shortId is required");
        }
        const playlist = await PlayList.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        const updateQuery = videoId ? { videos: new mongoose.Types.ObjectId(videoId) } : { shorts: new mongoose.Types.ObjectId(shortId) };
        const updatedPlaylist = await PlayList.findByIdAndUpdate(playlist._id, {
            $pull: updateQuery
        }, {
            new: true
        });
        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
    })
    deletePlaylist = asyncHandler(async (req, res) => {
        const { playlistId } = req.params;
        if (!playlistId) {
            throw new ApiError(400, "PlaylistId is required")
        }
        const playlist = await PlayList.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        const isDeleted = await PlayList.findByIdAndDelete(playlist._id);
        if (!isDeleted) {
            throw new ApiError(500, "Failed to delete playlist");
        }
        return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
    })
    updatePlaylist = asyncHandler(async (req, res) => {
        const { playlistId } = req.params
        const { name, description } = req.body
        if ((!name && !description) || !playlistId) {
            throw new ApiError(400, "Name or description and playlistId is required");
        }
        const playlist = await PlayList.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        if (name) {
            playlist.name = name;
        }
        if (description) {
            playlist.description = description;
        }
        const updatedPlaylist = await playlist.save({ validateBeforeSave: false });
        if (!updatedPlaylist) {
            throw new ApiError(500, "Failed to update playlist");
        }
        return res.status(200).json(new ApiResponse(200, null, "Playlist updated successfully"));
    })
}


export default new PlaylistController();