import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Video } from "../models/video.js";
import { User } from "../models/user.js";
import { Like } from "../models/like.js";
import { publishNotification } from "../lib/kafka/producer.js";
import { getCache, setCache } from "../lib/redis.js";
import { ObjectId } from "mongodb"
class VideoController {
    publishVideo = asyncHandler(async (req, res) => {
        const user = req.user;
        const { title, description, source, thumbnail, duration, subtitle, thumbnailPreviews } = req.body;
        if (!title || !description || !source || !thumbnail || !duration) throw new ApiError(400, "Please provide All required fields")
        const newVideo = await Video.create({
            source,
            thumbnail,
            duration,
            title,
            description,
            subtitle,
            thumbnailPreviews,
            userId: user._id
        })
        if (!newVideo) {
            throw new ApiError(500, "Failed to publish video")
        }
        //publishing notification
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channelId: user._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriberId",
                    foreignField: "_id",
                    as: "subscriber"
                }
            },
            {
                $addFields: {
                    subscriberId: {
                        $first: "$subscriber._id"
                    }
                }
            },
            {
                $project: {
                    subscriberId: 1,
                }
            }
        ]);
        const message = `@${user.username} uploaded : "${title}"`;
        subscribers.forEach((s) => {
            publishNotification({
                userId: s.subscriberId,
                message,
                video: {
                    _id: newVideo._id,
                    thumbnail,
                },
                creator: {
                    _id: user._id,
                    avatar: user.avatar,
                    fullname: user.fullname
                },
                read: false,
                createdAt: new Date(Date.now()),
            });
        })
        //end
        return res.status(200).json(new ApiResponse(200, null, "Video published successfully"))
    })

    deleteVideo = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!videoId) throw new ApiError(400, "video id is required")
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
        if (!videoId) throw new ApiError(400, "videoId is required")
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
    getLikedVideos = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    userId,
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
                    source: "$video.source",
                    thumbnailPreviews: "$video.thumbnailPreviews",
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

    getVideoById = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const video = await Video.aggregate(
            [
                {
                    $match: {
                        _id: new ObjectId(videoId)
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
                        __v: 0
                    }
                }
            ]
        )
        return res.status(200).json(new ApiResponse(200, { video: video[0] }, "Video fetched successfully"))
    })
    getVideosByUserId = asyncHandler(async (req, res) => {
        const { username } = req.params;
        if (!username) throw new ApiError(400, "Please provide username")
        const user = await User.findOne({ username })
        if (!user) throw new ApiError(400, "User not found")
        const videos = await Video.aggregate([
            {
                $match: {
                    userId: user._id
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
                    __v: 0,
                }
            }, {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        console.log({ videos })
        return res.status(200).json(new ApiResponse(200, { videos }, "this channel's all videos fetched successfully"))
    })

    getVideosByQuery = asyncHandler(async (req, res) => {
        const { query, page = 1, limit = 12 } = req.query;

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

        return res.status(200).json(
            new ApiResponse(200, { videos }, "Videos fetched successfully")
        );
    });

    getRecommendedVideos = asyncHandler(async (req, res) => {
        const { videoId, userId, page = 1, limit = 12 } = req.query;
        let video;

        if (videoId) {
            video = await Video.findById(videoId);
        }

        const cacheKey = `recommendedVideos:${userId}:${videoId}:allVideos`;
        let allVideos = await getCache(cacheKey);
        if (!allVideos) {
            let recommendations = [];
            let notToBeRecommended = [];
            if (video) {
                notToBeRecommended.push(video._id.toString());
            }

            if (userId) {
                const user = await User.findById(userId);
                if (user.watchHistory.videoIds) {
                    notToBeRecommended.push(...user.watchHistory.videoIds);
                }
                // Fetch user-specific recommendations first
                if (video) {
                    const videosBySameCreator = await Video.find({
                        userId: video.userId,
                        _id: { $nin: notToBeRecommended }
                    }).populate("userId", "username fullname avatar")
                    if (videosBySameCreator.length) {
                        recommendations.push(...videosBySameCreator);
                        notToBeRecommended.push(...videosBySameCreator.map(v => v._id.toString()));
                    }
                }

                if (video?.tags?.length) {
                    const videosBySameTags = await Video.find({
                        tags: { $in: video.tags },
                        _id: { $nin: notToBeRecommended }
                    }).populate("userId", "username fullname avatar")
                    if (videosBySameTags.length) {
                        recommendations.push(...videosBySameTags);
                        notToBeRecommended.push(...videosBySameTags.map(v => v._id.toString()));
                    }
                }

                const usersWithSimilarHistory = await User.find({
                    _id: { $ne: userId },
                    "watchHistory.videoIds": { $in: user.watchHistory.videoIds || [] }
                })

                for (let similarUser of usersWithSimilarHistory) {
                    let videos = await Video.aggregate([
                        {
                            $match: {
                                _id: {
                                    $nin: notToBeRecommended
                                },
                                _id: {
                                    $in: similarUser.watchHistory?.videoIds || []
                                }
                            }
                        }
                    ]).populate("userId", "username fullname avatar")
                    if (videos.length) {
                        recommendations.push(...videos);
                        notToBeRecommended.push(...videos.map(v => v._id.toString()));
                    }
                }
            }

            let remainingSlots = 50 - recommendations.length;
            if (remainingSlots) {
                let split1 = Math.floor(remainingSlots / 2);
                let split2 = remainingSlots - split1;

                let recentVideos = await Video.find({
                    _id: { $nin: notToBeRecommended }
                })
                    .sort({ createdAt: -1 }).limit(split1).populate("userId", "username fullname avatar")

                if (recentVideos.length) {
                    recommendations.push(...recentVideos);
                    notToBeRecommended.push(...recentVideos.map(v => v._id.toString()));
                }

                let popularVideos = await Video.find({ _id: { $nin: notToBeRecommended } })
                    .sort({ views: -1 }).limit(split2).populate("userId", "username fullname avatar")
                if (popularVideos.length) {
                    recommendations.push(...popularVideos);
                    notToBeRecommended.push(...popularVideos.map(v => v._id.toString()));
                }
            }
            recommendations = recommendations.map(r => {
                r._doc.creator = r._doc.userId;
                delete r._doc.userId;
                return r._doc;
            });
            setCache(cacheKey, recommendations);
            allVideos = recommendations;
        }

        const scoreVideo = async (video, userId) => {
            let score = 0;
            if (video.views) {
                score += video.views * 0.3;
            }
            if (video.createdAt) {
                const daysSincePosted = (new Date() - new Date(video.createdAt)) / (1000 * 3600 * 24);
                score += Math.max(0, 30 - daysSincePosted) * 1;
            }
            if (video.tags?.length && userId) {
                // Assume some custom logic here to calculate similarity score with user's watch history
                const user = await User.findById(userId);
                const watchedTags = user.watchHistory.tags || [];
                const commonTags = video.tags.filter(tag => watchedTags.includes(tag));
                score += commonTags.length * 2; // Boost score for videos with common tags
            }

            return score;
        };

        const getVideoScores = async (videos, userId) => {
            const scores = await Promise.all(videos.map(v => scoreVideo(v, userId)));
            return videos.map((v, i) => ({ ...v, score: scores[i] }));
        };

        allVideos = await getVideoScores(allVideos, userId);
        allVideos.sort((a, b) => b.score - a.score);

        const startIndex = (page - 1) * limit;
        const paginatedVideos = allVideos.slice(startIndex, startIndex + limit);

        return res.status(200).json(new ApiResponse(200, { recommendations: paginatedVideos }, 'Recommended Videos fetched successfully'));
    }
    );

    increaseViews = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        if (!videoId) throw new ApiError(400, "Please provide videoId")
        const video = await Video.findById(videoId);
        video.views++;
        await video.save({ validateBeforeSave: false })
        return res.status(200).json(new ApiResponse(200, null, "successfully video's views increased"))
    })

    getUserVideosCount = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        if (!userId) {
            throw new ApiError(400, "user id is required");
        }
        const videosCount = await Video.countDocuments({ userId: new ObjectId(userId) })
        return res.status(200).json(new ApiResponse(200, { videosCount }, "videos count fetched successfully"))
    })
}

export const videoController = new VideoController();