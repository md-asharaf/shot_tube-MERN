import { asyncHandler } from '../utils/handler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

class UserC {
    //controller to change current password of a user
    changeCurrentPassword = asyncHandler(async (req, res) => {
        const { password, newPassword, confirmPassword } = req.body;

        if (!(newPassword === confirmPassword)) {
            throw new ApiError(400, "New password and confirm password do not match")
        }
        if (password == newPassword) {
            throw new ApiError(400, "New password cannot be the same as current password")
        }
        if (!newPassword?.trim()) {
            throw new ApiError(400, "New password is required,cannot be empty")
        }
        const user = await User.findById(req.user?._id);
        const isPasswordCorrect = await user?.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid current password")
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
    })
    //controller to get current user
    getCurrentUser = asyncHandler(async (req, res) => {
        return res.status(200).json(new ApiResponse(200, req.user, req.user?"User found":"User not found"))
    })
    //controller to update account details of a user
    updateAccountDetails = asyncHandler(async (req, res) => {
        const { email, fullname,avatar,coverImage } = req.body;
        if(!email || !fullname || !avatar || !coverImage){
            throw new ApiError(400, "All fields are required")
        }
        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                fullname,
                email,
                avatar,
                coverImage
            }
        }, {
            new: true
        })?.select("-password -refreshToken");
        return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
    })
    //controller to get user profile details
    getUserDetails = asyncHandler(async (req, res) => {
        const { username } = req.params;
        if (!username) {
            throw new ApiError(400, "can not find user")
        }
        const channel = await User.aggregate([
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
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriberId",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount: { $size: "$subscribers" },
                    subscribedToCount: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriberId"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribedToCount: 1,
                    subscriberCount: 1,
                    isSubscribed: 1
                }
            },
        ]);

        if (!channel?.length) {
            throw new ApiError(404, "Channel not found")
        }
        return res.status(200).json(new ApiResponse(200, channel[0], "Channel found"));
    })
    addVideoToWatchHistory = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        await User.findByIdAndUpdate(userId, {
            $push:{
                watchHistory: new mongoose.Types.ObjectId(videoId)
            }
        });
        return res.status(200).json(new ApiResponse(200, {}, "Video added to watch history"))
    })
    removeVideoFromWatchHistory = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        await User.findByIdAndUpdate(userId, {
            $pull: {
                watchHistory: new mongoose.Types.ObjectId(videoId)
            }
        }, { new: true });
        return res.status(200).json(new ApiResponse(200,{}, "Video removed from watch history"))
    })
    // controller to get watch history of a user
    getWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(400, "Username is required")
        }
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
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
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1
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
                        }
                    ]
                }
            }
        ])
        return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history found"))
    })
    clearWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        await User.findByIdAndUpdate(userId, { $set: { watchHistory: [] } }, { new: true });
        return res.status(200).json(new ApiResponse(200,{}, "Watch history cleared"))
    })
}
export default new UserC();