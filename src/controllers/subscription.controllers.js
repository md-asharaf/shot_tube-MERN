import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Subscription from "../models/subscription.models.js";

// controller to toggle subscription to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;
    const subscription = await Subscription.findOne({ channelId, subscriberId });
    let response;
    if (subscription) {
        response = await Subscription.findByIdAndDelete(subscription._id);
    }
    else {
        response = await Subscription.create({ channelId, subscriberId });
    }
    return res.status(201).json(new ApiResponse(201, response, "Subscription created successfully"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscribers = await Subscription.countDocuments({ channelId });
    return res.status(200).json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscriptions = await Subscription.countDocuments({ subscriberId });
    return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}