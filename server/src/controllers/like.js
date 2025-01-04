import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.js";
import mongoose from "mongoose";

class LikeController {
    toggleCommentLike = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!commentId) {
            throw new ApiError(400, "Comment id is required")
        }
        const dbLike = await Like.findOne({ commentId: new mongoose.Types.ObjectId(commentId), userId: new mongoose.Types.ObjectId(userId) })
        let response;
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
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} comment`))
    })
    toggleVideoLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!videoId) throw new ApiError(400, "Video id is required");
        const dbLike = await Like.findOne({ videoId: new mongoose.Types.ObjectId(videoId), userId: new mongoose.Types.ObjectId(userId) });
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
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} video`));
    })
    toggleTweetLike = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const userId = req.user?._id;
        if (!tweetId || !userId) throw new ApiError(400, "Tweet id nand User id are required");
        const dbLike = await Like.findOne({ tweetId: new mongoose.Types.ObjectId(tweetId), userId: new mongoose.Types.ObjectId(userId) })
        if (!dbLike) {
            await Like.create({
                userId,
                tweetId,
                videoId: null,
                commentId: null
            })
        } else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} tweet`))
    })

    isLiked = asyncHandler(async (req, res) => {
        const { commentId, videoId, tweetId } = req.params;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401,"unauthorized")
        }
        if (!commentId && !videoId && !tweetId) throw new ApiError(400, "Comment id, video id or tweet id is required");
        let liked = false;
        if (commentId) {
            const dbLike = await Like.findOne({ commentId: new mongoose.Types.ObjectId(commentId), userId: new mongoose.Types.ObjectId(userId) });
            liked = dbLike ? true : false;
        }
        if (videoId) {
            const dbLike = await Like.findOne({ videoId: new mongoose.Types.ObjectId(videoId), userId: new mongoose.Types.ObjectId(userId) });
            liked = dbLike ? true : false;
        }
        if (tweetId) {
            const dbLike = await Like.findOne({ tweetId: new mongoose.Types.ObjectId(tweetId), userId: new mongoose.Types.ObjectId(userId) });
            liked = dbLike ? true : false;
        }
        return res.status(200).json(new ApiResponse(200, { isLiked: liked }, `user has${liked ? "" : " not"} liked this video`))
    })
}

export default new LikeController();
