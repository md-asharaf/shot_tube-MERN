import { asyncHandler } from '../utils/handler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';
import bcrypt from "bcrypt"
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
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
        const resetLink = `https://${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const { error } = await resend.emails.send({
            to: email,
            from: `noreply@${process.env.RESEND_DOMAIN}`,
            subject: "Password Reset",
            text: `Click the link to reset your password: ${resetLink}`
        })
        if (error) {
            throw new ApiError(500, error.message)
        }
        return res.status(200).json(new ApiResponse(200, null, "we have sent the password reset link on your email."))
    })
    changeCurrentPassword = asyncHandler(async (req, res) => {
        const { password, newPassword, confirmPassword } = req.body;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!password || !newPassword || !confirmPassword) {
            throw new ApiError(400, "All fields are required")
        }
        if (!(newPassword === confirmPassword)) {
            throw new ApiError(400, "New password and confirm password do not match")
        }
        if (password == newPassword) {
            throw new ApiError(400, "New password cannot be the same as current password")
        }
        const user = await User.findById(req.user?._id);
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
            throw new ApiError(401, "Reset Token is invalid")
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
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
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
    getUserDetails = asyncHandler(async (req, res) => {
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
    addVideoToWatchHistory = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!videoId) {
            throw new ApiError(400, "video id is required")
        }
        const response = await User.findByIdAndUpdate(userId, {
            $push: {
                watchHistory: new mongoose.Types.ObjectId(videoId)
            }
        });
        if (!response) {
            throw new ApiError(400, "video not found")
        }
        return res.status(200).json(new ApiResponse(200, null, "Video added to watch history"))
    })
    removeVideoFromWatchHistory = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!videoId) {
            throw new ApiError(400, "video id is required")
        }
        const response = await User.findByIdAndUpdate(userId, {
            $pull: {
                watchHistory: new mongoose.Types.ObjectId(videoId)
            }
        }, { new: true });
        if (!response) {
            throw new ApiError(400, "video not found")
        }
        return res.status(200).json(new ApiResponse(200, null, `Video removed from watch history`))
    })
    getWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        const users = await User.aggregate([
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
        return res.status(200).json(new ApiResponse(200, { watchHistory: users[0]?.watchHistory }, "Watch history found"))
    })
    clearWatchHistory = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        await User.findByIdAndUpdate(userId, { $set: { watchHistory: [] } }, { new: true });
        return res.status(200).json(new ApiResponse(200, null, "Watch history cleared"))
    })
    saveVideoToWatchLater = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!videoId) {
            throw new ApiError(400, "video id is required")
        }
        const response = await User.findByIdAndUpdate(userId, {
            $push: { watchLater: new mongoose.Types.ObjectId(videoId) }
        }, { new: true })
        if (!response) {
            throw new ApiError(400, "video not found")
        }
        return res.status(200).json(new ApiResponse(200, null, "Video added to watch later"))
    })
    removeVideoFromWatchLater = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!videoId) {
            throw new ApiError(400, "video id is required")
        }
        const response = await User.findByIdAndUpdate(userId, {
            $pull: { watchLater: new mongoose.Types.ObjectId(videoId) }
        }, { new: true });
        if (!response) {
            throw new ApiError(400, "video not found")
        }
        return res.status(200).json(new ApiResponse(200, null, "Video removed from watch later"))
    })
    getWatchLater = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        const users = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchLater",
                    foreignField: "_id",
                    as: "watchLater",
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
        return res.status(200).json(new ApiResponse(200, { watchLater: users[0]?.watchLater }, "Watch later found"))
    })
    isSavedToWatchLater = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if ( !videoId) {
            throw new ApiError(400, "video id bis required")
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        const isSaved = user.watchLater.includes(videoId);
        return res.status(200).json(new ApiResponse(200, { isSaved }, `Video ${isSaved ? "is" : "is not"} saved to watch later`))
    })
}
export default new UserController();