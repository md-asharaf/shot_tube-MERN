import { Reply } from "../models/reply.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/handler.js";

class ReplyController {
    createReply = asyncHandler(async (req, res) => {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user?._id;
        if (!commentId || !content) {
            throw new ApiError(400, "Both Comment ID and Content are required");
        }

        const reply = await Reply.create({
            content,
            userId,
            commentId
        });

        return res.status(201).json(new ApiResponse(201, reply, "Reply added successfully"));
    });

    updateReply = asyncHandler(async (req, res) => {
        const { replyId } = req.params;
        const { content } = req.body;

        if (!replyId || !content) {
            throw new ApiError(400, "Both Reply ID and Content are required");
        }

        const reply = await Reply.findByIdAndUpdate(replyId, { content }, { new: true });
        if (!reply) {
            throw new ApiError(404, "Reply not found");
        }
        return res.status(200).json(new ApiResponse(200, reply, "Reply updated successfully"));
    });

    deleteReply = asyncHandler(async (req, res) => {
        const { replyId } = req.params;

        if (!replyId) {
            throw new ApiError(400, "Reply ID is required to delete a reply");
        }

        const reply = await Reply.findByIdAndDelete(replyId);
        if (!reply) {
            throw new ApiError(404, "Reply not found");
        }
        return res.status(200).json(new ApiResponse(200, null, "Reply deleted successfully"));
    });

    // Get replies for a comment
    getReplies = asyncHandler(async (req, res) => {
        const { commentId } = req.params;

        if (!commentId) {
            throw new ApiError(400, "Comment ID is required to fetch replies");
        }

        const replies = await Reply.find({ commentId }).populate("userId", "username avatar");

        return res.status(200).json(new ApiResponse(200, {replies}, "Replies fetched successfully"));
    });
}

export default new ReplyController();
