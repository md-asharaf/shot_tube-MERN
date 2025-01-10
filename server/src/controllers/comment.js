import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.js";
import { Video } from "../models/video.js";
import mongoose from "mongoose";
import { publishNotification } from "../lib/kafka/producer.js";
import { User } from "../models/user.js";

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
        return res.status(200).json(new ApiResponse(200, { comments }, "Comments fetched successfully"))
    })
    addComment = asyncHandler(async (req, res) => {
        const { content, sentiment } = req.body;
        const { videoId } = req.params;
        const userId = req.user?._id;

        if (!content || !videoId || !sentiment) {
            throw new ApiError(400, "Content, video ID, and sentiment are required");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Invalid video ID provided");
        }

        const comment = await Comment.create({
            content,
            videoId,
            userId,
            sentiment,
        });

        if (!comment) {
            throw new ApiError(500, "Comment could not be created");
        }

        const [user, videoCreator] = await Promise.all([
            User.findById(userId),
            User.findById(video.userId),
        ]);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (!videoCreator) {
            throw new ApiError(404, "Video creator not found");
        }
        const message = `@${user.username} commented: "${content}"`;
        publishNotification({
            userId: videoCreator._id,
            message,
            video: {
                _id: video._id,
                thumbnail: video.thumbnail,
                creatorImage: videoCreator.avatar,
            },
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { comment }, "Comment created successfully"));
    });

    deleteComment = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId) {
            throw new ApiError(400, "Comment ID is required")
        }
        const deletedComment = await Comment.findOneAndDelete({ _id: new mongoose.Types.ObjectId(commentId), userId });
        if (!deletedComment) {
            throw new ApiError(404, "Comment not found or you are not authorized to delete it")
        }
        return res.status(200).json(new ApiResponse(200, { deletedComment }, "Comment deleted successfully"))
    })
    updateComment = asyncHandler(async (req, res) => {
        const { content } = req.body;
        const { commentId } = req.params;
        const userId = req.user?._id;
        if (!commentId || !content) {
            throw new ApiError(400, "comment ID and content are required")
        }

        const comment = await Comment.findOne({ _id: new mongoose.Types.ObjectId(commentId), userId });
        if (!comment) {
            throw new ApiError(404, "Comment not found or you are not authorized to update it")
        }

        comment.content = content;
        const updatedComment = await comment.save({ validateBeforeSave: true });
        if (!updatedComment) {
            throw new ApiError(500, "comment could not be updated")
        }
        return res.status(200).json(new ApiResponse(200, { updatedComment }, "Comment updated successfully"))
    })
}

export default new CommentController();