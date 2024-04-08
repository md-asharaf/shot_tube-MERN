import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Tweet from "../models/tweet.models.js";

//controller to create a tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return new ApiError(400, "Content is required")
    }
    const tweet = await Tweet.create({
        content,
        userId: req.user._id
    })
    if (!tweet) {
        return new ApiError(500, "Tweet could not be created")
    }
    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))

})
//controller to get all tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const tweets = await Tweet.aggregate([
        {
            $match: {
                userId
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})
//controller to update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!content) {
        return new ApiError(400, "content is required")
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        {
            $set: {
                content
            }
        }
    })
return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})
//controller to delete a tweet  
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}