import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { Cloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
        return res.status(200).json(new ApiResponse(200, req.user, "Current User found"))
    })
    //controller to update account details of a user
    updateAccountDetails = asyncHandler(async (req, res) => {
        const { email, fullname } = req.body;
        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: {
                fullname,
                email
            }
        }, {
            new: true
        })?.select("-password -refreshToken");
        return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
    })
    //controller to update avatar of a user
    updateAvatar = asyncHandler(async (req, res) => {
        const avatarLocalPath = req.file?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required")
        }
        const avatar = await Cloudinary.upload(avatarLocalPath, "image");
        if (!avatar || !avatar.url) {
            throw new ApiError(500, "Failed to upload avatar")
        }
        const user = await User.findById(req.user?._id).select("-password -refreshToken");
        const public_id = user.avatar.public_id;
        user.avatar = avatar;
        await user.save({ validateBeforeSave: false });
        await Cloudinary.delete(public_id);
        return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
    })
    //controller to update cover image of a user
    updateCoverImage = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(400, "User id is required")
        }
        const coverImageLocalPath = req.file?.path;
        if (!coverImageLocalPath) {
            throw new ApiError(400, "cover image is required")
        }
        const coverImage = await Cloudinary.upload(coverImageLocalPath, "image");
        if (!coverImage || !coverImage.url) {
            throw new ApiError(500, "Failed to upload cover image")
        }
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const public_id = user.coverImage?.public_id || "";
        user.coverImage = coverImage;
        user.save({ validateBeforeSave: false });
        await Cloudinary.delete(public_id);
        return res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"))

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
    // controller to get watch history of a user
    getWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(400, "Username is required")
        }
        const user = await User.aggregate([
            {
                $match: {
                    _id: userId
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
                                as: "owner",
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
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ])
        return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history found"))
    })

}
export default new UserC();