import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.models.js";

//controller to create a tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user?._id;
    if (!content) {
        throw new ApiError(400, "Content is required")
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
//controller to update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;
    if (!content || !tweetId) {
        throw new ApiError(400, "Content and tweetId are required")
    }
    const tweet = await Tweet.findOne({ _id: tweetId, userId });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to update it")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweet._id, {
        $set: {
            content
        }
    }, {
        new: true
    })
    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})
//controller to delete a tweet  
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;
    if (!tweetId || !userId) {
        throw new ApiError(400, "Tweet id and User id are required")
    }
    const tweet = await Tweet.findOne({ _id: tweetId, userId });
    const isDeleted = await Tweet.findByIdAndDelete(tweet._id);
    if (!isDeleted) {
        throw new ApiError(500, "Failed to delete tweet");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

//controller to get all tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user?._id;
    if (!userId) {
        throw new ApiError(400, "User id is required")
    }
    const tweets = await Tweet.aggregate([
        {
            $match: {
                userId
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
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}