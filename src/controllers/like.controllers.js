import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Like from "../models/like.models.js";

// controller to toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => { })
// controller to toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => { })
// controller to toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => { })
// controller to get all liked videos of a user
const getLikedVideos = asyncHandler(async (req, res) => { })

export { toggleCommentLike, toggleTweetLike, getLikedVideos, toggleVideoLike }
