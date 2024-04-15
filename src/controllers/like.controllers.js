import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";
import mongoose from "mongoose";

class LikeC {
    // controller to toggle like on a comment
    static toggleCommentLike = asyncHandler(async (req, res) => {
        //get comment id from request params
        const { commentId } = req.params;
        //get user id from request user object
        const userId = req.user?._id;
        //check if comment id is provided
        if (!commentId) throw new ApiError(400, "Comment id is required");
        //find if user has liked the comment
        const like = await Like.findOne({ commentId, userId })
        let response;
        //if user has liked the comment, delete the like, else create a like
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
    static toggleVideoLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
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
    static toggleTweetLike = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const userId = req.user?._id;
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
    static getLikedVideos = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        if (!userId) throw new ApiError(400, "User id is required");
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    tweetId: null,
                    commentId: null
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videoId",
                    foreignField: "_id",
                    as: "video",
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
                                            fullname: 1,
                                            avatar: 1,
                                            _id: 0
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: { $first: "$owner" }
                            }
                        },
                        {
                            $project: {
                                owner: 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    video: {
                        $first: "$video"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    video: 1,
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(200, likedVideos.map(video => video.video), "Success"))
    })
}

export { LikeC }
