import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.js";
import { Reply } from "../models/reply.js";
class LikeController {
    toggleCommentLike = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId) {
            throw new ApiError(400, "Comment id is required")
        }
        const dbLike = await Like.findOne({ commentId: new mongoose.Types.ObjectId(commentId), userId })
        if (!dbLike) {
            await Like.create({
                commentId,
                userId
            })
        }
        else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} comment`))
    })
    toggleVideoLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!videoId) throw new ApiError(400, "Video id is required");
        const dbLike = await Like.findOne({ videoId: new mongoose.Types.ObjectId(videoId), userId });
        if (!dbLike) {
            await Like.create({
                videoId,
                userId
            })
        }
        else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} video`));
    })
    toggleTweetLike = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const userId = req.user?._id;
        if (!tweetId) throw new ApiError(400, "Tweet id is required");
        const dbLike = await Like.findOne({ tweetId: new mongoose.Types.ObjectId(tweetId), userId })
        if (!dbLike) {
            await Like.create({
                userId,
                tweetId,
            })
        } else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} tweet`))
    })
    toggleReplyLike = asyncHandler(async (req, res) => {
        const { replyId } = req.params;
        const userId = req.user?._id;
        if (!replyId) throw new ApiError(400, "Reply id is required");
        const dbLike = await Like.findOne({ replyId: new mongoose.Types.ObjectId(replyId), userId });
        if (!dbLike) {
            await Like.create({
                userId,
                replyId,
            })
        } else {
            await Like.findByIdAndDelete(dbLike._id)
        }
        return res.status(200).json(new ApiResponse(200, null, `${dbLike ? "unliked" : "liked"} reply`))
    })
    isVideoLiked = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!videoId) throw new ApiError(400, "video id is required");
        const dbLike = await Like.findOne({ videoId: new mongoose.Types.ObjectId(videoId), userId });
        const likesCount = await Like.countDocuments({ videoId: new mongoose.Types.ObjectId(videoId) });
        return res.status(200).json(new ApiResponse(200, { isLiked: !!dbLike,likesCount }, `user has${!!dbLike ? "" : " not"} liked this video`))
    })
    videoCommentsLike = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!videoId) throw new ApiError(400, "Video id is required");
        const comments = await Comment.find({
            videoId: new mongoose.Types.ObjectId(videoId),
        })
        let isLiked = {};
        for (let comment of comments) {
            isLiked[comment._id] = { status: !!(await Like.findOne({ commentId: comment._id, userId })), count: await Like.countDocuments({ commentId: comment._id }) }
        }
        return res.status(200).json(new ApiResponse(200, { isLiked }, "User has liked these comments"))
    })
    commentRepliesLike = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId) throw new ApiError(400, "Comment id is required");
        const replies = await Reply.find({
            commentId: new mongoose.Types.ObjectId(commentId)
        })
        let isLiked = {};
        for (let reply of replies) {
            isLiked[reply._id] = { status: !!(await Like.findOne({ replyId: reply._id, userId })), count: await Like.countDocuments({ replyId: reply._id }) }
        }
        return res.status(200).json(new ApiResponse(200, { isLiked }, "User has liked these replies"))
    })
}

export default new LikeController();
