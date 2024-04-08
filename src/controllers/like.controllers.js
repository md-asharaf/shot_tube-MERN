import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Like from "../models/like.models.js";

// controller to toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    if (!commentId) throw new ApiError(400, "Comment id is required");
    const like = await Like.findOne({ commentId, userId })
    let response;
    if (like) {
        response = await Like.findByIdAndDelete(like._id)
    } else {
        response = await Like.create({
            commentId,
            userId,
            videoId: null,
            tweetId: null
        })
    }
    return res.status(200).json(new ApiResponse(200, response, "Success"))
})
// controller to toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;
    if (!videoId) throw new ApiError(400, "Video id is required");
    const like = await Like.findOne({ videoId, userId });
    let response;
    if (like) {
        response = await Like.findByIdAndDelete(like._id);
    } else {
        response = await Like.create({
            videoId,
            userId,
            commentId: null,
            tweetId: null
        });
    }
    return res.status(200).json(new ApiResponse(200, response, "Success"));
})
// controller to toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;
    if (!tweetId) throw new ApiError(400, "Comment id is required");
    const tweet = await Like.findOne({ tweetId, userId })
    let response;
    if (tweet) {
        response = await Like.findByIdAndDelete(tweet._id)
    } else {
        response = await Like.create({
            tweetId,
            userId,
            videoId: null,
            commentId: null
        })
    }
    return res.status(200).json(new ApiResponse(200, response, "Success"))
})
// controller to get all liked videos of a user
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const like = await Like.aggregate([
        {
            $match: {
                userId,
                tweetId: null,
                commentId: null
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
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
                                        username: 1,
                                        fullName: 1,
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

    return res.status(200).json(new ApiResponse(200, like.videos, "Success"))
})

export { toggleCommentLike, toggleTweetLike, getLikedVideos, toggleVideoLike }
