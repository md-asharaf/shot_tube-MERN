import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Comment from "../models/comment.models.js";

//controller to get all comments of a video
const getAllVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        return new ApiError(400, "Video ID is required")
    }
    const comments = await Comment.aggregate([
        {
            $match: {
                videoId
            }
        },
        {
            $project: {
                content: 1,
                userId: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
})
//controller to create a comment
const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;

    if (!content || !videoId) {
        return new ApiError(400, "Content and Video ID are required")
    }

    const comment = await Comment.create(
        {
            content,
            videoId,
            userId: req.user._id
        }
    )
    console.log(comment)
    if (!comment) {
        return new ApiError(400, "Comment could not be created")
    }
    return res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"))

})
//controller to delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.body;
    if (!commentId) {
        return new ApiError(400, "Comment ID is required")
    }
    const comment = await Comment.findByIdAndDelete(commentId)
    console.log(comment)
    if (!comment) {
        return new ApiError(404, "Comment not found,Could not be deleted")
    }
    return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"))
})
//controller to update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { content, commentId } = req.body;
    if (!commentId || !content) {
        return new ApiError(400, "comment ID and content both are required")
    }
    const updatedComment = await Comment.findByIdAndUpadate(commentId, {
        $set: {
            content
        }
    })
    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})



export { createComment, deleteComment, getAllVideoComments, updateComment }