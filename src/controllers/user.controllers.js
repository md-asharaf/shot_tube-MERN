import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from front-end or postman
    const { username, email, password, fullname } = req.body;
    //validation
    if (
        [username, email, password, fullname].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    //check if user exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }
    //check for images,check for avatar
    let avatarLocalPath, coverImageLocalPath;
    if (req.files) {
        if (req.files.avatar && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0]?.path;
        }
        if (req.files.coverImage && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0]?.path;
        }
    }

    //upload to cloudinary,avatar
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("avatar cloudinary response", avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }
    //create user object - create entry in db
    const user = await User.create({
        email,
        password,
        fullname,
        avatar,
        coverImage,
        username: username.toLowerCase()
    })
    //remove password and refresh token fields from response
    const createdUser = await User.findById(user._id)?.select("-password -refreshToken");
    //check for response
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }
    //send response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    //get user details from front-end or postman
    const { username, email, password } = req.body;
    //validate details
    if (!username && !email) {
        throw new ApiError(400, "either username or email is required")
    }
    if (!password) {
        throw new ApiError(400, "password is required")
    }
    //check if user exists
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (!existedUser) {
        throw new ApiError(404, "User not found");
    }
    //check if password is correct
    const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid username or password");
    }
    //generate token
    const { accessToken, refreshToken } = await generateTokens(existedUser._id);
    //send response in cookies
    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }, "user logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1
        }
    })
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
        clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAcessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required")
    }
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(400, "Invalid refresh token")
    }
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(400, "refresh token is expired or used")
    }
    const { accessToken, refreshToken } = generateTokens(user._id);
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
            accessToken,
            refreshToken,
        }, "Access Token refreshed"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
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

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User found"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
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

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar || !avatar.url) {
        throw new ApiError(500, "Failed to upload avatar")
    }
    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    const public_id = user.avatar.public_id;
    user.avatar = avatar;
    user.save({ validateBeforeSave: false });
    await deleteFromCloudinary(public_id);
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage || !coverImage.url) {
        throw new ApiError(500, "Failed to upload cover image")
    }
    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    const public_id = user?.coverImage?.public_id || "";
    user.coverImage = coverImage;
    user.save({ validateBeforeSave: false });
    await deleteFromCloudinary(public_id);
    return res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"))

})

const getUserProfileDetails = asyncHandler(async (req, res) => {
    const { username } = req?.params;
    console.log(username)
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
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
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
    console.log(channel)

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "Channel found"));
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const { username } = req?.params;
    if (!username) {
        throw new ApiError(400, "Username is required")
    }
    const user = await User.aggregate([
        {
            $match: {
                username
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
                            localField: "owner",
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
    console.log(user)
    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history found"))
})

export { registerUser, loginUser, logoutUser, refreshAcessToken, updateAccountDetails, getCurrentUser, changeCurrentPassword, updateAvatar, updateCoverImage, getUserProfileDetails, getWatchHistory };