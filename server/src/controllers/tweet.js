import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.js";
import mongoose from "mongoose";

class TweetController {
    createTweet = asyncHandler(async (req, res) => {
        const { content } = req.body;
        const userId = req.user?._id;
        if (!userId || !content) {
            throw new ApiError(400, "Content and userId are required")
        }
        const tweet = await Tweet.create({
            content,
            userId
        })
        if (!tweet) {
            throw new ApiError(500, "Tweet could not be created")
        }
        return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))

    })
    updateTweet = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const { content } = req.body;
        const userId = req.user?._id;
        if (!content || !tweetId || !userId) {
            throw new ApiError(400, "Content,userId and tweetId are required")
        }
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found")
        }
        if (tweet.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to update this tweet")
        }
        tweet.content = content;
        const updatedTweet = await tweet.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
    })
    deleteTweet = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const userId = req.user?._id;
        if (!tweetId || !userId) {
            throw new ApiError(400, "Tweet id and User id are required")
        }
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found")
        }
        if (tweet.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to delete this tweet")
        }
        const isDeleted = await Tweet.findByIdAndDelete(tweet._id);
        if (!isDeleted) {
            throw new ApiError(500, "Failed to delete tweet");
        }
        return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
    })

    getUserTweets = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        if (!userId) {
            throw new ApiError(400, "User id is required")
        }
        const tweets = await Tweet.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    _id: 0
                }
            }
        ])
        return res.status(200).json(new ApiResponse(200, { tweets }, "Tweets fetched successfully"))
    })
}

export default new TweetController();