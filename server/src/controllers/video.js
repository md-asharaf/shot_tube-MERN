import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.js";
import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Like } from "../models/like.js";
class VideoController {
    publishVideo = asyncHandler(async (req, res) => {
        const { title, description, video, thumbnail, duration, subtitle } = req.body;
        if (!title || !description || !video || !thumbnail || !duration) throw new ApiError(400, "Please provide All required fields")
        const userId = req.user?._id;
        if (!userId) throw new ApiError(400, "Please provide userId")
        const newVideo = await Video.create({
            video,
            thumbnail,
            duration,
            title,
            description,
            subtitle,
            userId
        })
        if (!newVideo) {
            throw new ApiError(500, "Failed to publish video")
        }
        return res.status(200).json(new ApiResponse(200, null, "Video published successfully"))
    })

    deleteVideo = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!userId || !videoId) throw new ApiError(400, "Please provide userId and videoId")
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(400, "invalid videoId")
        }
        if (video.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to delete this video")
        }
        await Video.findByIdAndDelete(video._id);
        return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"))
    })
    updateVideoDetails = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!userId || !videoId) throw new ApiError(400, "Please provide userId and videoId")
        const { title, description } = req.body;
        if (!title && !description) {
            throw new ApiError(400, "Please provide title or description")
        }
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(500, "Invalid videoId")
        }
        if (video.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to update this video")
        }
        if (title) video.title = title;
        if (description) video.description = description;
        await video.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, null, "Video updated successfully"))
    })
    togglePublishStatus = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        if (!videoId) throw new ApiError(400, "Please provide videoId")
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found")
        }
        video.isPublished = !video.isPublished;
        await video.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, null, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
    })

    getAllVideos = asyncHandler(async (req, res) => {
        const { page, limit } = req.query;
        if (!page || !limit) throw new ApiError(400, "Please provide page and limit")
        const videos = await Video.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator",
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
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: page * Number(limit)
            },
            {
                $limit: Number(limit)
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    thumbnail: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                    creator: {
                        _id: 1,
                        username: 1,
                        fullname: 1,
                        avatar: 1
                    }
                }
            }
        ])
        return res.status(200).json(new ApiResponse(200, { videos }, "All videos fetched successfully"))
    })
    getLikedVideos = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if (!userId) throw new ApiError(400, "Please provide userId");
    
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    videoId: { $ne: null },
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videoId",
                    foreignField: "_id",
                    as: "video",
                },
            },
            {
                $addFields: {
                    video: { $first: "$video" }, 
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "video.userId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            {
                $addFields: {
                    creator: {
                        $first: "$creator", 
                    },
                },
            },
            {
                $project: {
                    _id: "$video._id", 
                    title: "$video.title",
                    thumbnail: "$video.thumbnail",
                    duration: "$video.duration",
                    views: "$video.views",
                    createdAt: "$video.createdAt",
                    updatedAt: "$video.updatedAt",
                    creator: {
                        _id: 1,
                        username: 1,
                        fullname: 1,
                        avatar: 1,
                    },
                },
            },
        ]);
    
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { likedVideos },
                    "All liked videos fetched successfully"
                )
            );
    });
    
    getSingleVideo = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const video = await Video.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(videoId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "creator"
                    }
                }, {
                    $addFields: {
                        creator: {
                            $first: "$creator"
                        }
                    }
                }, {
                    $project: {
                        userId: 0,
                        isPublished: 0,
                        __v: 0
                    }
                }
            ]
        )
        return res.status(200).json(new ApiResponse(200, { video: video[0] }, "Video fetched successfully"))
    })
    getUserVideos = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        if (!userId) throw new ApiError(400, "Please provide userId")
        const videos = await Video.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator",
                }
            },
            {
                $addFields: {
                    creator: {
                        $first: "$creator"
                    }
                }
            }, {
                $project: {
                    userId: 0,
                    isPublished: 0,
                    __v: 0,
                }
            }, {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        return res.status(200).json(new ApiResponse(200, { videos }, "this channel's all videos fetched successfully"))
    })

    getVideosByQuery = asyncHandler(async (req, res) => {
        const { query, page = 1, limit = 10 } = req.query;
    
        if (!query) throw new ApiError(400, "Please provide a search query");
    
        const skip = (page - 1) * limit;
    
        const pipeline = [
            // Match stage: Search in title and description
            {
                $match: {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } },
                    ],
                },
            },
            // Lookup stage: Fetch creator details
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            // Flatten creator array
            {
                $addFields: {
                    creator: { $first: "$creator" },
                },
            },
            // Scoring logic: Combine views, recency, and relevance
            {
                $addFields: {
                    customScore: {
                        $add: [
                            { $multiply: [{ $divide: ["$views", 1000] }, 0.4] }, // Views weight
                            {
                                $multiply: [
                                    { $subtract: [new Date(), "$createdAt"] },
                                    -0.00000001,
                                ],
                            }, // Recency weight
                            {
                                $cond: {
                                    if: {
                                        $or: [
                                            { $regexMatch: { input: "$title", regex: query, options: "i" } },
                                            { $regexMatch: { input: "$description", regex: query, options: "i" } },
                                        ],
                                    },
                                    then: 1.5, // Relevance boost
                                    else: 0,
                                },
                            },
                        ],
                    },
                },
            },
            // Exclude sensitive fields
            {
                $project: {
                    userId: 0,
                    isPublished: 0,
                    __v: 0,
                },
            },
            // Sort by custom score
            {
                $sort: { customScore: -1 },
            },
            // Pagination
            { $skip: skip },
            { $limit: parseInt(limit) },
        ];
    
        const videos = await Video.aggregate(pipeline);
    
        // Count total for pagination metadata
        const total = await Video.countDocuments({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
        });
    
        const metadata = {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
        };
    
        return res.status(200).json(
            new ApiResponse(200, { videos, metadata }, "Videos fetched successfully")
        );
    });
    
    getRecommendedVideos = asyncHandler(async (req, res) => {
        const { user } = req;
        const { videoId } = req.params;
        if (!videoId) {
            throw new ApiError(400, "Please provide videoId")
        }
        const currentVideo = await Video.findById(videoId);
        if (!currentVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        let watchedVideoIds = [];
        let recommendations = [];

        if (user) {
            const userData = await User.findById(user._id).populate('watchHistory');
            watchedVideoIds = userData.watchHistory.map(video => video._id);

            recommendations = await Video.aggregate([
                {
                    $match: {
                        _id: {
                            $nin: [videoId, ...watchedVideoIds]
                        },
                        isPublished: true
                    }
                },
                {
                    $addFields: {
                        contentScore: {
                            $size: {
                                $setIntersection: [
                                    { $split: [{ $toLower: "$title" }, " "] },
                                    { $split: [{ $toLower: currentVideo.title }, " "] }
                                ]
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        collaborativeScore: {
                            $cond: [
                                { $in: ["$userId", userData.watchHistory.map(v => v.userId)] },
                                5,
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        popularityScore: {
                            $divide: [
                                "$views",
                                { $max: [1, "$views"] }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        totalScore: {
                            $add: [
                                { $multiply: ["$contentScore", 2] },
                                { $multiply: ["$collaborativeScore", 3] },
                                { $multiply: ["$popularityScore", 1.5] }
                            ]
                        }
                    }
                },
                { $sort: { totalScore: -1 } },
                { $sample: { size: 5 } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'creator'
                    }
                },
                { $unwind: '$creator' },
                { $limit: 10 }
            ]);
        }

        if (!user || recommendations.length < 10) {
            const additionalVideos = await Video.aggregate([
                {
                    $match: {
                        _id: {
                            $nin: [
                                videoId,
                                ...watchedVideoIds,
                                ...recommendations.map(r => r._id)
                            ]
                        },
                        isPublished: true
                    }
                },
                { $sample: { size: 10 - recommendations.length } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'creator'
                    }
                },
                { $unwind: '$creator' },
            ]);
            recommendations.push(...additionalVideos);
        }

        recommendations = recommendations.filter(video => String(video._id) !== String(videoId));

        return res.status(200).json(new ApiResponse(200, { recommendations }, 'Recommended videos fetched successfully'));
    });

    increaseViews = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        if (!videoId) throw new ApiError(400, "Please provide videoId")
        const video = await Video.findById(videoId);
        video.views++;
        await video.save({ validateBeforeSave: false })
        return res.status(200).json(new ApiResponse(200, null, "successfully video's views increased"))
    })
}

export default new VideoController();