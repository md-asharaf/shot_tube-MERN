import { asyncHandler } from "../utils/handler.js";
import { User } from "../models/user.js";
import { Video } from "../models/video.js";
import { Playlist } from "../models/playlist.js";
import { Short } from "../models/short.js";
import { Post } from "../models/post.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
class StudioController {
    getUserPosts = asyncHandler(async (req, res) => {
        const { page = 1, limit = 5 } = req.query;
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const aggregate = Post.aggregate([
            {
                $match: {
                    userId: user._id,
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "postId",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "postId",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    likes: { $size: "$likes" },
                    comments: { $size: "$comments" }
                }
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    type: 1,
                    visibility: 1,
                    createdAt: 1,
                    likes: 1,
                    comments: 1
                }
            }
        ]);
        const posts = await Post.aggregatePaginate(aggregate, { page, limit })

        return res.status(200).json(new ApiResponse(200, { posts }, "Posts fetched successfully for studio"));
    });
    getUserVideos = asyncHandler(async (req, res) => {
        const { page = 1, limit = 5 } = req.query;
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const aggregate = Video.aggregate([
            {
                $match: {
                    userId: user._id,
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "videoId",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "videoId",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    likes: { $size: "$likes" },
                    comments: { $size: "$comments" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    source: 1,
                    visibility: 1,
                    createdAt: 1,
                    likes: 1,
                    comments: 1,
                    views: 1,
                    duration: 1,
                    categories: 1,
                }
            }
        ]);
        const videos = await Video.aggregatePaginate(aggregate, { page, limit })

        return res.status(200).json(new ApiResponse(200, { videos }, "Videos fetched successfully for studio"));
    });
    getUserPlaylists = asyncHandler(async (req, res) => {
        const { page = 1, limit = 5 } = req.query;
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const aggregate = Playlist.aggregate([
            {
                $match: {
                    userId: user._id,
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $addFields: {
                    videoCount: { $size: "$videos" },
                    thumbnail: { $first: "$videos.thumbnail" }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    type: 1,
                    visibility: 1,
                    updatedAt: 1,
                    videos: 1,
                    shorts: 1,
                    videoCount: 1,
                    thumbnail: 1,
                }
            }
        ]);
        const playlists = await Playlist.aggregatePaginate(aggregate, { page, limit })

        return res.status(200).json(new ApiResponse(200, { playlists }, "Playlists fetched successfully for studio"));
    });
    getUserShorts = asyncHandler(async (req, res) => {
        const { page = 1, limit = 5 } = req.query;
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const aggregate = Short.aggregate([
            {
                $match: {
                    userId: user._id,
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "shortId",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "shortId",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    likes: { $size: "$likes" },
                    comments: { $size: "$comments" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    source: 1,
                    visibility: 1,
                    createdAt: 1,
                    likes: 1,
                    comments: 1,
                    views: 1,
                    duration: 1,
                    categories: 1,
                }
            }
        ]);
        const shorts = await Short.aggregatePaginate(aggregate, { page, limit })

        return res.status(200).json(new ApiResponse(200, { shorts }, "Shorts fetched successfully for studio"));
    });
}

export const studioController = new StudioController();