import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Short } from "../models/short.js";
import { User } from "../models/user.js";
import { Like } from "../models/like.js";
import { publishNotification } from "../lib/kafka/producer.js";
import { getCache, setCache } from "../lib/redis.js";
class ShortController {
    publishShort = asyncHandler(async (req, res) => {
        const user = req.user;
        const { title, description, source, thumbnail, subtitle, thumbnailPreviews } = req.body;
        if (!title || !description || !source || !thumbnail || !duration) throw new ApiError(400, "Please provide All required fields")
        const newShort = await Short.create({
            source,
            thumbnail,
            duration,
            title,
            description,
            subtitle,
            thumbnailPreviews,
            userId: user._id
        })
        if (!newShort) {
            throw new ApiError(500, "Failed to publish Short")
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
                short: {
                    _id: newShort._id,
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
        return res.status(200).json(new ApiResponse(200, null, "Short published successfully"))
    })

    deleteShort = asyncHandler(async (req, res) => {
        const { shortId } = req.params;
        const userId = req.user?._id;
        if (!shortId) throw new ApiError(400, "Short id is required")
        const short = await Short.findById(shortId);
        if (!short) {
            throw new ApiError(400, "invalid ShortId")
        }
        if (short.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to delete this Short")
        }
        await Short.findByIdAndDelete(short._id);
        return res.status(200).json(new ApiResponse(200, null, "Short deleted successfully"))
    })
    updateShortDetails = asyncHandler(async (req, res) => {
        const { shortId } = req.params;
        const userId = req.user?._id;
        if (!shortId) throw new ApiError(400, "ShortId is required")
        const { title, description } = req.body;
        if (!title && !description) {
            throw new ApiError(400, "Please provide title or description")
        }
        const short = await Short.findById(shortId);
        if (!short) {
            throw new ApiError(500, "Invalid ShortId")
        }
        if (short.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to update this Short")
        }
        if (title) Short.title = title;
        if (description) Short.description = description;
        await Short.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, null, "Short updated successfully"))
    })

    getLikedShorts = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        const likedShorts = await Like.aggregate([
            {
                $match: {
                    userId,
                    shortId: { $ne: null },
                },
            },
            {
                $lookup: {
                    from: "shorts",
                    localField: "shortId",
                    foreignField: "_id",
                    as: "short",
                },
            },
            {
                $addFields: {
                    Short: { $first: "$short" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "short.userId",
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
                    _id: "$short._id",
                    title: "$short.title",
                    thumbnail: "$short.thumbnail",
                    duration: "$short.duration",
                    views: "$short.views",
                    createdAt: "$short.createdAt",
                    updatedAt: "$short.updatedAt",
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
                    { likedShorts },
                    "All liked Shorts fetched successfully"
                )
            );
    });

    getShortById = asyncHandler(async (req, res) => {
        const { shortId } = req.params;

        let short = await Short.findById(shortId)
            .populate("userId", "username fullname avatar")
            .select("-__v")
            .lean();

        short.creator = short.userId;
        delete short.userId;

        short.next = (await Short.findOne({ createdAt: { $gt: short.createdAt } })
            .sort({ createdAt: 1 })
            .select("_id")
            .lean())?._id ?? "";

        short.prev = (await Short.findOne({ createdAt: { $lt: short.createdAt } })
            .sort({ createdAt: -1 })
            .select("_id")
            .lean())?._id ?? "";
        return res.status(200).json(new ApiResponse(200, { short }, "Short fetched successfully"));
    });

    getShortsByUsername = asyncHandler(async (req, res) => {
        const { username } = req.params;
        if (!username) throw new ApiError(400, "Please provide username")
        const user = await User.findOne({ username });
        if (!user) throw new ApiError(400, "Please provide valid username")
        const shorts = await Short.aggregate([
            {
                $match: {
                    userId: user._id,
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
        return res.status(200).json(new ApiResponse(200, { shorts }, "this channel's all Shorts fetched successfully"))
    })

    getShortsByQuery = asyncHandler(async (req, res) => {
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

        const shorts = await Short.aggregate(pipeline);
        return res.status(200).json(
            new ApiResponse(200, { shorts }, "Shorts fetched successfully")
        );
    });

    getRecommendedShorts = asyncHandler(async (req, res) => {
        const { shortId, userId, page = 1, limit = 12 } = req.query;
        let short;
        if (shortId) {
            short = await Short.findById(shortId);
        }

        const cacheKey = `recommendedShorts:${userId}:${shortId}:allShorts`;

        let allShorts = await getCache(cacheKey);
        if (!allShorts) {
            let recommendations = [];
            let notToBeRecommended = [];
            if (short) {
                notToBeRecommended.push(short._id.toString());
            }

            if (userId) {
                const user = await User.findById(userId);
                if (user.watchHistory.shortIds) {
                    notToBeRecommended.push(...user.watchHistory.shortIds);
                }
                // Fetch user-specific recommendations first
                if (short) {
                    const shortsBySameCreator = await Short.find({
                        userId: short.userId,
                        _id: { $nin: notToBeRecommended }
                    }).populate("userId", "username fullname avatar")
                    if (shortsBySameCreator.length) {
                        recommendations.push(...shortsBySameCreator);
                        notToBeRecommended.push(...shortsBySameCreator.map(s => s._id.toString()));
                    }
                }

                if (short?.tags?.length) {
                    const shortsBySameTags = await Short.find({
                        tags: { $in: short.tags },
                        _id: { $nin: notToBeRecommended }
                    }).populate("userId", "username fullname avatar")

                    if (shortsBySameTags.length) {
                        recommendations.push(...shortsBySameTags);
                        notToBeRecommended.push(...shortsBySameTags.map(s => s._id.toString()));
                    }
                }

                const usersWithSimilarHistory = await User.find({
                    _id: { $ne: userId },
                    "watchHistory.shortIds": { $in: user.watchHistory.shortIds || [] }
                })

                for (let similarUser of usersWithSimilarHistory) {
                    let shorts = await Short.aggregate([
                        {
                            $match: {
                                _id: {
                                    $nin: notToBeRecommended
                                },
                                _id: {
                                    $in: similarUser.watchHistory?.shortIds || []
                                }
                            }
                        }
                    ]).populate("userId", "username fullname avatar")
                    if (shorts.length) {
                        recommendations.push(...shorts);
                        notToBeRecommended.push(...shorts.map(s => s._id.toString()));
                    }
                }
            }

            let remainingSlots = 50 - recommendations.length;
            if (remainingSlots) {
                let split1 = Math.floor(remainingSlots / 2);
                let split2 = remainingSlots - split1;

                let recentShorts = await Short.find({
                    _id: { $nin: notToBeRecommended }
                })
                    .sort({ createdAt: -1 }).limit(split1).populate("userId", "username fullname avatar")

                if (recentShorts.length) {
                    recommendations.push(...recentShorts);
                    notToBeRecommended.push(...recentShorts.map(s => s._id.toString()));
                }

                let popularShorts = await Short.find({ _id: { $nin: notToBeRecommended } })
                    .sort({ views: -1 }).limit(split2).populate("userId", "username fullname avatar")

                if (popularShorts.length) {
                    recommendations.push(...popularShorts);
                    notToBeRecommended.push(...popularShorts.map(s => s._id.toString()));
                }
            }
            recommendations = recommendations.map(r => {
                r._doc.creator = r._doc.userId;
                delete r._doc.userId;
                return r._doc;
            });
            setCache(cacheKey, recommendations);
            allShorts = recommendations;
        }
        const scoreShort = async (short, userId) => {
            let score = 0;
            if (short.views) {
                score += short.views * 0.3;
            }
            if (short.createdAt) {
                const daysSincePosted = (new Date() - new Date(short.createdAt)) / (1000 * 3600 * 24);
                score += Math.max(0, 30 - daysSincePosted) * 1;
            }
            if (short.tags?.length && userId) {
                // Assume some custom logic here to calculate similarity score with user's watch history
                const user = await User.findById(userId);
                const watchedTags = user.watchHistory.tags || [];
                const commonTags = short.tags.filter(tag => watchedTags.includes(tag));
                score += commonTags.length * 2; // Boost score for shorts with common tags
            }

            return score;
        };

        const getShortScores = async (shorts, userId) => {
            const scores = await Promise.all(shorts.map(s => scoreShort(s, userId)));
            return shorts.map((s, i) => ({ ...s, score: scores[i] }));
        };

        allShorts = await getShortScores(allShorts, userId);
        allShorts.sort((a, b) => b.score - a.score);

        const startIndex = (page - 1) * limit;
        const paginatedShorts = allShorts.slice(startIndex, startIndex + limit);

        return res.status(200).json(new ApiResponse(200, { recommendations: paginatedShorts }, 'Recommended Shorts fetched successfully'));
    }
    );

    increaseViews = asyncHandler(async (req, res) => {
        const { shortId } = req.params;
        if (!shortId) throw new ApiError(400, "Please provide ShortId")
        const short = await Short.findById(shortId);
        short.views++;
        await Short.save({ validateBeforeSave: false })
        return res.status(200).json(new ApiResponse(200, null, "successfully Short's views increased"))
    })
}

export const shortController = new ShortController();