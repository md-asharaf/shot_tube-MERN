import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import PlayList from "../models/playlist.models.js";

//controller to create a playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;
    if (!name || !description) throw new ApiError(400, "Name and description are required");
    const playlist = await PlayList.create({
        name,
        description,
        userId
    })
    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
})
//controller to get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
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
    const { playlistId, userId } = req.params
    // const playlist = await PlayList.findById(playlistId).populate({
    //     path: "videos",
    //     populate: {
    //         path: "userId",
    //         select: "fullname"
    //     }
    // })

    const playlist = await PlayList.aggregate([
        {
            $match: {
                _id: playlistId,
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
    ]);
    return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
})
//controller to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const videoId = req.body.videoId;
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
    const { playlistId, videoId } = req.params;
    const playlist = await PlayList.findByIdAndUpdate(playlistId, {
        $pull: {
            videos: videoId
        },
    }, {
        new: true
    });
    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
})
//controller to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    await PlayList.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
})
// controller to update the name or description or both of a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!name && !description) throw new ApiError(400, "Name or description is required");
    const playlist = await PlayList.findByIdAndUpdate(playlistId, {
        $set: {
            name,
            description
        }
    }, {
        new: true
    });
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})


export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist }