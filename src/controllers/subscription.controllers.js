import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.models.js";

// controller to toggle subscription to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;
    if (!channelId || !subscriberId) {
        throw new ApiError(400, "Channel Id and subscriber Id are required")
    }
    const subscription = await Subscription.findOne({ channelId, subscriberId });
    let response;
    if (subscription) {
        response = await Subscription.findByIdAndDelete(subscription._id);
    }
    else {
        response = await Subscription.create({ channelId, subscriberId });
    }
    return res.status(201).json(new ApiResponse(201, response, `${subscription ? "Unsubscribed" : "Subscribed"} successfully`));
})

// controller to return subscriber list of a channel
const getSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.user?._id;
    if (!channelId) {
        throw new ApiError(400, "Channel Id is required");
    }
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriberId",
                foreignField: "_id",
                as: "name"
            }
        },
        {
            $addFields: {
                name: {
                    $first: "$name.fullname"
                }
            }
        },
        {
            $project: {
                name: 1,
                _id: 0
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, {
        subscribersCount: subscribers.length,
        subscribers
    }, "Subscribed channels fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user?._id;
    if (!subscriberId) {
        throw new ApiError(400, "Subscriber Id is required");
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriberId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channelId",
                foreignField: "_id",
                as: "channelName"
            }
        },
        {
            $addFields: {
                channelName: {
                    $first: "$channelName.fullname"
                }
            }
        },
        {
            $project: {
                channelName: 1,
                _id: 0
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, { subscribedChannelsCount: subscribedChannels.length, subscribedChannels }, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getSubscribers,
    getSubscribedChannels
}