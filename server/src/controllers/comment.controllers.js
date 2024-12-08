import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";

class CommentC {
    //controller to get all comments of a video
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
        //construct aggregate first
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
        //pass the aggregate as a query and paginate the results
        const comments = await Comment.aggregatePaginate(aggregate, { page, limit });
        return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
    })
    //controller to create a comment
    addComment = asyncHandler(async (req, res) => {
        //get content and video id from request body and params
        const { content, sentiment } = req.body;
        const { videoId } = req.params;
        const userId = req.user?._id;
        //check if content and video id are provided
        if (!content || !videoId) {
            throw new ApiError(400, "Content and Video ID are required")
        }
        //check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Invalid video ID provided")
        }
        //create a comment
        const comment = await Comment.create(
            {
                content,
                videoId,
                userId,
                sentiment
            }
        )
        //check if comment is created
        if (!comment) {
            throw new ApiError(500, "Comment could not be created")
        }
        return res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"))

    })
    //controller to delete a comment
    deleteComment = asyncHandler(async (req, res) => {
        //get comment id from request params and user id from request user
        const { commentId } = req.params;
        const userId = req.user?._id;
        //check if comment id is provided
        if (!commentId) {
            throw new ApiError(400, "Comment ID is required")
        }
        //find comment by id and user id
        const comment = await Comment.findOneAndDelete({ _id: new mongoose.Types.ObjectId(commentId), userId:new mongoose.Types.ObjectId(userId) });
        if (!comment) {
            throw new ApiError(404, "Comment not found or you are not authorized to delete it")
        }
        return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"))
    })
    //controller to update a comment
    updateComment = asyncHandler(async (req, res) => {
        //get comment id, content and user id from request params, body and user
        const { content } = req.body;
        const { commentId } = req.params;
        const userId = req.user?._id;
        //check if comment id and content are provided
        if (!commentId || !content) {
            throw new ApiError(400, "comment ID and content both are required")
        }

        //find comment by id and user id
        const comment = await Comment.findOne({  _id: new mongoose.Types.ObjectId(commentId), userId:new mongoose.Types.ObjectId(userId) });
        if (!comment) {
            throw new ApiError(404, "Comment not found or you are not authorized to update it")
        }

        //update the comment
        comment.content = content;
        //save it and store
        const updatedComment = await comment.save({ validateBeforeSave: true });
        if (!updatedComment) {
            throw new ApiError(500, "comment could not be updated")
        }
        return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
    })
}

export default new CommentC();