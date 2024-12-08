import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";
import mongoose from "mongoose";

class LikeC {
    // controller to toggle like on a comment
    toggleCommentLike = asyncHandler(async (req, res) => {
        //get comment id from request params
        const { commentId } = req.params;
        //get user id from request user object
        const userId = req.user?._id;
        //check if comment id is provided
        if (!commentId) throw new ApiError(400, "Comment id is required");
        //find if user has liked the comment
        const dbLike = await Like.findOne({ commentId:new mongoose.Types.ObjectId(commentId), userId:new mongoose.Types.ObjectId(userId) })
        let response;
        //if user has liked the comment, delete the like, else create a like
        if (!dbLike) {
            response = await Like.create({
                commentId,
                userId,
                videoId: null,
                tweetId: null
            })
        }
        else {
            response = await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, response, `${dbLike ? "unliked" : "liked"} comment`))
    })
    // controller to toggle like on a video
    toggleVideoLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user._id;
        if (!videoId) throw new ApiError(400, "Video id is required");
        const dbLike = await Like.findOne({videoId:new mongoose.Types.ObjectId(videoId), userId:new mongoose.Types.ObjectId(userId) });
        let response;
        if (!dbLike) {
            response = await Like.create({
                videoId,
                userId,
                commentId: null,
                tweetId: null
            })
        }
        else {
            response = await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, response, `${dbLike ? "unliked" : "liked"} video`));
    })
    // controller to toggle like on a tweet
    toggleTweetLike = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const userId = req.user._id;
        if (!tweetId) throw new ApiError(400, "Comment id is required");
        const dbLike = await Like.findOne({ tweetId:new mongoose.Types.ObjectId(tweetId), userId:new mongoose.Types.ObjectId(userId) })
        let response;
        if (!dbLike) {
            response = await Like.create({
                userId,
                tweetId,
                videoId: null,
                commentId: null
            })
        } else {
            response = await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, response, `${dbLike ? "unliked" : "liked"} tweet`))
    })
    // controller to get all liked videos of a user
    getLikedVideos = asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const result = await Like.aggregate([
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
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    video: {
                        $first: "$video"
                    },
                    creator: {
                        $first: "$creator"
                    }
                }
            }, {
                $project: {
                    video: 1,
                }
            }
        ]);
        const likedVideos = result.map(obj => obj.video)
        return res.status(200).json(new ApiResponse(200, likedVideos, "Success"))
    })

    isLiked = asyncHandler(async (req, res) => {
        const { commentId, videoId, tweetId } = req.params;
        const userId = req.user._id;
        if (!commentId && !videoId && !tweetId) throw new ApiError(400, "Comment id, video id or tweet id is required");
        let liked = false;
        if (commentId) {
            const dbLike = await Like.findOne({ commentId:new mongoose.Types.ObjectId(commentId), userId:new mongoose.Types.ObjectId(userId) });
            liked = dbLike ? true : false;
        }
        if (videoId) {
            const dbLike = await Like.findOne({videoId:new mongoose.Types.ObjectId(videoId), userId:new mongoose.Types.ObjectId(userId) });
            liked = dbLike ? true : false;
        }
        if (tweetId) {
            const dbLike = await Like.findOne({ tweetId:new mongoose.Types.ObjectId(tweetId), userId:new mongoose.Types.ObjectId(userId) });
            liked = dbLike ? true : false;
        }
        return res.status(200).json(new ApiResponse(200, liked, `user has${liked ? "" : " not"} liked this video`))
    })
}

export default new LikeC();
