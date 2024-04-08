import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Tweet from "../models/tweet.models.js";

//controller to create a tweet
const createTweet = asyncHandler(async (req, res) => {
})
//controller to get all tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
})
//controller to update a tweet
const updateTweet = asyncHandler(async (req, res) => {
})
//controller to delete a tweet  
const deleteTweet = asyncHandler(async (req, res) => {
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}