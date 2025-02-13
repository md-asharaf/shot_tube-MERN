import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.js";
import { Subscription } from "../models/subscription.js";
import { publishNotification } from "../lib/kafka/producer.js";
import { ObjectId } from "mongodb"
class TweetController {
    createTweet = asyncHandler(async (req, res) => {
        const { content, image } = req.body;
        const user = req.user;
        if (!content || !image) {
            throw new ApiError(400, "Content is required")
        }
        const tweet = await Tweet.create({
            content,
            image,
            userId: user._id
        })
        if (!tweet) {
            throw new ApiError(500, "Tweet could not be created")
        }
        //publishing notification
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channelId: user._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriberId",
                    foreignField: "_id",
                    as: "subscriber"
                }
            },
            {
                $addFields: {
                    subscriberId: {
                        $first: "$subscriber._id"
                    }
                }
            },
            {
                $project: {
                    subscriberId: 1,
                }
            }
        ]);
        const message = `@${user.username} posted: "${content}"`;
        subscribers.forEach((s) => {
            publishNotification({
                userId: s.subscriberId,
                message,
                tweet: {
                    _id: tweet._id,
                    image: tweet.image,
                },
                creator: {
                    _id: user._id,
                    avatar: user.avatar,
                    fullname: user.fullname
                },
                read: false,
                createdAt: new Date(Date.now()),
            });
        })
        //end
        return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))

    })
    updateTweet = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const { content } = req.body;
        const userId = req.user?._id;
        if (!content || !tweetId) {
            throw new ApiError(400, "Content and tweetId are required")
        }
        const tweet = await Tweet.findOne({ _id: new ObjectId(tweetId), userId });
        if (!tweet) {
            throw new ApiError(404, "Tweet not found")
        }
        tweet.content = content;
        const updatedTweet = await tweet.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
    })
    deleteTweet = asyncHandler(async (req, res) => {
        const { tweetId } = req.params;
        const userId = req.user?._id;
        if (!tweetId) {
            throw new ApiError(400, "Tweet id is required")
        }
        const tweet = await Tweet.findOne({ _id: new ObjectId(tweetId), userId });
        if (!tweet) {
            throw new ApiError(404, "Tweet not found")
        }
        const isDeleted = await Tweet.findByIdAndDelete(tweet._id);
        if (!isDeleted) {
            throw new ApiError(500, "Failed to delete tweet");
        }
        return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
    })

    getUserTweets = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
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
        return res.status(200).json(new ApiResponse(200, { tweets }, "Tweets fetched successfully"))
    })
}

export default new TweetController();