import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.models.js";
import mongoose, { Schema } from "mongoose";
//controller to get all comments of a video
const getAllVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
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
                as: "commentedBy"
            }
        },
        {
            $addFields: {
                commentedBy: {
                    $first: "$commentedBy.fullname"
                }
            }
        },
        {
            $project: {
                content: 1,
                commentedBy: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0
            }

        }
    ]);
    //pass the aggregate as a query and paginate the results
    const comments = await Comment.aggregatePaginate(aggregate, { page, limit });
    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
})
//controller to create a comment
const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
    if (!content || !videoId) {
        throw new ApiError(400, "Content and Video ID are required")
    }

    const comment = await Comment.create(
        {
            content,
            videoId,
            userId: req.user._id
        }
    )
    if (!comment) {
        throw new ApiError(500, "Comment could not be created")
    }
    return res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"))

})
//controller to delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }
    const comment = await Comment.findOneAndDelete({ _id: commentId, userId })
    if (!comment) {
        throw new ApiError(404, "Comment not found or you are not authorized to delete it")
    }
    return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"))
})
//controller to update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user._id;
    if (!commentId || !content) {
        throw new ApiError(400, "comment ID and content both are required")
    }

    //find comment by id and user id
    const comment = await Comment.findById(commentId);

    // console.log(comment)
    if (!comment) {
        console.log("comment not found")
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



export { addComment, deleteComment, getAllVideoComments, updateComment }