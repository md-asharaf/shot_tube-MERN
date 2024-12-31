import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";

class CommentController {
    getAllVideoComments = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        if (!videoId) {
            throw new ApiError(400, "Video ID is required")
        }
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Invalid video ID provided")
        }
        const aggregate = Comment.aggregate([
            {
                $match: {
                    videoId: new mongoose.Types.ObjectId(videoId)
                }
            }
            ,
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $addFields: {
                    creator: {
                        $first: "$creator"
                    }
                }
            },
            {
                $project: {
                    content: 1,
                    sentiment: 1,
                    createdAt: 1,
                    creator: 1
                }

            }, {
                $sort: {
                    createdAt: -1
                }
            }
        ]);
        const comments = await Comment.aggregatePaginate(aggregate, { page, limit });
        return res.status(200).json(new ApiResponse(200, {comments}, "Comments fetched successfully"))
    })
    addComment = asyncHandler(async (req, res) => {
        const { content, sentiment } = req.body;
        const { videoId } = req.params;
        const userId = req.user?._id;
        if (!content || !videoId || !userId || !sentiment) {
            throw new ApiError(400, "Content, video ID, user ID and sentiment are required")
        }
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Invalid video ID provided")
        }
        const comment = await Comment.create(
            {
                content,
                videoId,
                userId,
                sentiment
            }
        )
        if (!comment) {
            throw new ApiError(500, "Comment could not be created")
        }
        return res.status(201).json(new ApiResponse(201, {comment}, "Comment created successfully"))

    })
    deleteComment = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId || !userId) {
            throw new ApiError(400, "Comment ID and User id is required")
        }
        const deletedComment = await Comment.findOneAndDelete({ _id: new mongoose.Types.ObjectId(commentId), userId:new mongoose.Types.ObjectId(userId) });
        if (!deletedComment) {
            throw new ApiError(404, "Comment not found or you are not authorized to delete it")
        }
        return res.status(200).json(new ApiResponse(200, {deletedComment}, "Comment deleted successfully"))
    })
    updateComment = asyncHandler(async (req, res) => {
        const { content } = req.body;
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId || !content || !userId) {
            throw new ApiError(400, "comment ID and content and User id all are required")
        }

        const comment = await Comment.findOne({  _id: new mongoose.Types.ObjectId(commentId), userId:new mongoose.Types.ObjectId(userId) });
        if (!comment) {
            throw new ApiError(404, "Comment not found or you are not authorized to update it")
        }

        comment.content = content;
        const updatedComment = await comment.save({ validateBeforeSave: true });
        if (!updatedComment) {
            throw new ApiError(500, "comment could not be updated")
        }
        return res.status(200).json(new ApiResponse(200, {updatedComment}, "Comment updated successfully"))
    })
}

export default new CommentController();