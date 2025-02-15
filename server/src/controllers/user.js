import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { asyncHandler } from '../utils/handler.js';
import { ApiError } from '../utils/api-error.js';
import { User } from '../models/user.js';
import { ApiResponse } from '../utils/api-response.js';
import { ObjectId } from "mongodb";
import { sendEmail } from '../lib/resend.js';
class UserController {
    forgetPassword = asyncHandler(async (req, res) => {
        const { email }
            = req.body;
        if (!email) {
            throw new ApiError(400, "Email is required")
        }
        const user = await User.findOne({
            email
        });
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        const resetToken = await user.generatePasswordResetToken();
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const text = `Click the link to reset your password: ${resetLink}`;
        const subject = "Password Reset";
        const { error } = await sendEmail(email, subject, text);
        if (error) {
            throw new ApiError(500, error.message)
        }
        return res.status(200).json(new ApiResponse(200, null, "we have sent the password reset link on your email."))
    })
    changeCurrentPassword = asyncHandler(async (req, res) => {
        const { password, newPassword, confirmPassword } = req.body;
        const userId = req.user?._id;
        if (!password || !newPassword || !confirmPassword) {
            throw new ApiError(400, "All fields are required")
        }
        if (!(newPassword === confirmPassword)) {
            throw new ApiError(400, "New password and confirm password do not match")
        }
        if (password == newPassword) {
            throw new ApiError(400, "New password cannot be the same as current password")
        }
        const user = await User.findById(userId);
        const isPasswordCorrect = await user?.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid current password")
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"))
    })
    getCurrentUser = asyncHandler(async (req, res) => {
        return res.status(200).json(new ApiResponse(200, { user: req.user }, req.user ? "User found" : "User not found"))
    })
    resetPassword = asyncHandler(async (req, res) => {
        const { resetToken, password } = req.body;
        if (!resetToken || !password) {
            throw new ApiError(400, "Reset Token and password are required")
        }
        const { _id } = jwt.verify(resetToken, process.env.PASSWORD_RESET_TOKEN_SECRET);
        if (!_id) {
            throw new ApiError(400, "Reset Token is invalid")
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(_id, {
            $set: {
                password: hashedPassword
            }
        })
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        return res.status(200).json(new ApiResponse(200, null, 'password reset successfully'))
    })
    updateAccountDetails = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        const { email, fullname, avatar, coverImage } = req.body;
        if (!email || !fullname || !avatar || !coverImage) {
            throw new ApiError(400, "All fields are required")
        }
        const user = await User.findByIdAndUpdate(userId, {
            $set: {
                fullname,
                email,
                avatar,
                coverImage
            }
        }, {
            new: true
        })?.select("-password -refreshToken");
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        return res.status(200).json(new ApiResponse(200, null, "Account details updated successfully"))
    })
    getUserChannel = asyncHandler(async (req, res) => {
        const { username } = req.params;

        if (!username) {
            throw new ApiError(400, "Cannot find user");
        }

        const channels = await User.aggregate([
            {
                $match: {
                    username
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channelId",
                    as: "subscribers"
                }
            },
            {
                $project: {
                    _id: 0,
                    user: {
                        _id: "$_id",
                        fullname: "$fullname",
                        username: "$username",
                        avatar: "$avatar",
                        coverImage: "$coverImage"
                    },
                    subscribersCount: { $size: "$subscribers" }
                }
            }
        ]);

        if (!channels?.length) {
            throw new ApiError(404, "Channel not found");
        }

        return res.status(200).json(new ApiResponse(200, { channel: channels[0] }, "Channel found"));
    });

    getUsers = asyncHandler(async (req, res) => {
        const { search } = req.query;
        if (!search) {
            throw new ApiError(400, "email or username cannot be empty");
        }

        const users = await User.aggregate([
            {
                $match: {
                    $or: [
                        {
                            email: { $regex: search, $options: "i" }
                        },
                        {
                            username: { $regex: search, $options: "i" }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    fullname: 1,
                    avatar: 1,
                }
            }
        ]);

        if (!users.length) {
            throw new ApiError(404, "No users found matching the search criteria");
        }
        return res.status(200).json(new ApiResponse(200, { users }, "users fetched with username or email successfully"))
    })
    addToWatchHistory = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        const userId = req.user?._id;
        if (!videoId && !shortId) {
            throw new ApiError(400, "video id or short id is required")
        }
        let updateQuery = {};
        if (videoId) {
            updateQuery["watchHistory.videoIds"] = new ObjectId(videoId);
        }
        if (shortId) {
            updateQuery["watchHistory.shortIds"] = new ObjectId(shortId);
        }
        await User.findByIdAndUpdate(userId, {
            $push: updateQuery
        });
        return res.status(200).json(new ApiResponse(200, null, "Video added to watch history"))
    })
    removeFromWatchHistory = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        const userId = req.user?._id;
        if (!videoId && !shortId) {
            throw new ApiError(400, "video id or short id is required")
        }
        let updateQuery = {};
        if (videoId) {
            updateQuery["watchHistory.videoIds"] = new ObjectId(videoId);
        }
        if (shortId) {
            updateQuery["watchHistory.shortIds"] = new ObjectId(shortId);
        }
        await User.findByIdAndUpdate(userId, {
            $pull: updateQuery
        }, { new: true });
        return res.status(200).json(new ApiResponse(200, null, `Video removed from watch history`))
    })
    getWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        const userObjectId = new ObjectId(userId);

        const users = await User.aggregate([
            {
                $match: { _id: userObjectId }
            },
            {
                $project: {
                    watchHistoryVideoIds: "$watchHistory.videoIds",
                    watchHistoryShortIds: "$watchHistory.shortIds"
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistoryVideoIds",
                    foreignField: "_id",
                    as: "watchHistoryVideos"
                }
            },
            {
                $lookup: {
                    from: "shorts",
                    localField: "watchHistoryShortIds",
                    foreignField: "_id",
                    as: "watchHistoryShorts"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "watchHistoryVideos.userId",
                    foreignField: "_id",
                    as: "videoCreators",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "watchHistoryShorts.userId",
                    foreignField: "_id",
                    as: "shortCreators",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    "watchHistoryVideos": {
                        $map: {
                            input: "$watchHistoryVideos",
                            as: "video",
                            in: {
                                $mergeObjects: [
                                    "$$video",
                                    {
                                        creator: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$videoCreators",
                                                        as: "creator",
                                                        cond: { $eq: ["$$creator._id", "$$video.userId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    "watchHistoryShorts": {
                        $map: {
                            input: "$watchHistoryShorts",
                            as: "short",
                            in: {
                                $mergeObjects: [
                                    "$$short",
                                    {
                                        creator: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$shortCreators",
                                                        as: "creator",
                                                        cond: { $eq: ["$$creator._id", "$$short.userId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    watchHistory: {
                        videos: "$watchHistoryVideos",
                        shorts: "$watchHistoryShorts"
                    }
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(200, { watchHistory: users[0]?.watchHistory || { videos: [], shorts: [] } }, "Watch history found"));
    });
    clearWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        await User.findByIdAndUpdate(userId, {
            $set: {
                watchHistory: {
                    videoIds: [],
                    shortIds: []
                }
            }
        }, { new: true });
        return res.status(200).json(new ApiResponse(200, null, "Watch history cleared"))
    })
    saveToWatchLater = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        const userId = req.user?._id;

        if (!videoId && !shortId) {
            throw new ApiError(400, "Video ID or Short ID is required");
        }

        let updateQuery = {};
        if (videoId) {
            updateQuery["watchLater.videoIds"] = new ObjectId(videoId);
        }
        if (shortId) {
            updateQuery["watchLater.shortIds"] = new ObjectId(shortId);
        }

        await User.findByIdAndUpdate(
            userId,
            { $push: updateQuery },
            { new: true }
        );
        return res.status(200).json(new ApiResponse(200, null, "Video added to watch later"));
    });

    removeFromWatchLater = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        const userId = req.user?._id;
        if (!videoId && !shortId) {
            throw new ApiError(400, "video id or short id is required")
        }
        let updateQuery = {};
        if (videoId) {
            updateQuery["watchLater.videoIds"] = new ObjectId(videoId);
        }
        if (shortId) {
            updateQuery["watchLater.shortIds"] = new ObjectId(shortId);
        }
        await User.findByIdAndUpdate(userId, {
            $pull: updateQuery
        }, { new: true });
        return res.status(200).json(new ApiResponse(200, null, "Video removed from watch later"))
    })
    getWatchLater = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        const userObjectId = new ObjectId(userId);

        const users = await User.aggregate([
            {
                $match: { _id: userObjectId }
            },
            {
                $project: {
                    watchLaterVideoIds: "$watchLater.videoIds",
                    watchLaterShortIds: "$watchLater.shortIds"
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchLaterVideoIds",
                    foreignField: "_id",
                    as: "watchLaterVideos"
                }
            },
            {
                $lookup: {
                    from: "shorts",
                    localField: "watchLaterShortIds",
                    foreignField: "_id",
                    as: "watchLaterShorts"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "watchLaterVideos.userId",
                    foreignField: "_id",
                    as: "videoCreators",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "watchLaterShorts.userId",
                    foreignField: "_id",
                    as: "shortCreators",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    "watchLaterVideos": {
                        $map: {
                            input: "$watchLaterVideos",
                            as: "video",
                            in: {
                                $mergeObjects: [
                                    "$$video",
                                    {
                                        creator: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$videoCreators",
                                                        as: "creator",
                                                        cond: { $eq: ["$$creator._id", "$$video.userId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    "watchLaterShorts": {
                        $map: {
                            input: "$watchLaterShorts",
                            as: "short",
                            in: {
                                $mergeObjects: [
                                    "$$short",
                                    {
                                        creator: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$shortCreators",
                                                        as: "creator",
                                                        cond: { $eq: ["$$creator._id", "$$short.userId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    watchLater: {
                        videos: "$watchLaterVideos",
                        shorts: "$watchLaterShorts"
                    }
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(200, { watchLater: users[0]?.watchLater || { videos: [], shorts: [] } }, "Watch later found"));
    });
    isSavedToWatchLater = asyncHandler(async (req, res) => {
        const { videoId, shortId } = req.query;
        const userId = req.user?._id;
        if (!videoId && !shortId) {
            throw new ApiError(400, "video id or short id is required")
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        let isSaved = false;
        if (videoId) isSaved = user.watchLater.videoIds.includes(videoId);
        else isSaved = user.watchLater.shortIds.includes(shortId);
        return res.status(200).json(new ApiResponse(200, { isSaved }, `Video ${isSaved ? "is" : "is not"} saved to watch later`))
    })
}
export const userController = new UserController();