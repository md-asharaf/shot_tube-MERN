import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.js";
import mongoose from "mongoose";
import { User } from "../models/user.js";
class SubscriptionController {

    toggleSubscription = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        const subscriberId = req.user?._id;
        if (!channelId) {
            throw new ApiError(400, "Channel Id is required")
        }
        let subscription = await Subscription.findOne({ channelId: new mongoose.Types.ObjectId(channelId), subscriberId });
        if (subscription) {
            await Subscription.findByIdAndDelete(subscription._id, { new: true });
            subscription = null;
        }
        else {
            subscription = await Subscription.create({ channelId, subscriberId });
        }
        return res.status(201).json(new ApiResponse(201, null, `${!subscription ? "Unsubscribed" : "Subscribed"} successfully`));
    })

    getUserChannelSubscribers = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        if (!channelId) {
            throw new ApiError(400, "Channel Id is required");
        }
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channelId: new mongoose.Types.ObjectId(channelId)
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
                    },
                    id: {
                        $first: "$name._id"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    id: 1,
                    _id: 0
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(200, {
            subscribersCount: subscribers.length,
            subscribers
        }, "Subscribed channels fetched successfully"));
    })

    getSubscribedChannels = asyncHandler(async (req, res) => {
        const { subscriberId } = req.params;
        if (!subscriberId) {
            throw new ApiError(400, "Subscriber Id is required");
        }
        const subscriber = await User.findById(subscriberId);
        if (!subscriber) {
            throw new ApiError(404, "Subscriber not found");
        }
        const subscribedChannels = await Subscription.aggregate([
            {
                $match: {
                    subscriberId: new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channelId",
                    foreignField: "_id",
                    as: "name"
                }
            },
            {
                $addFields: {
                    name: {
                        $first: "$name.fullname"
                    },
                    username: {
                        $first: "$name.username"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(200, { subscribedChannels }, "Subscribed channels fetched successfully"));
    })

    isSubscribed = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        const subscriberId = req.user?._id;
        if (!channelId) {
            throw new ApiError(400, "Channel Id is required")
        }
        const isSubscribed = await Subscription.findOne({ channelId: new mongoose.Types.ObjectId(channelId), subscriberId }) ? true : false;
        return res.status(200).json(new ApiResponse(200, { isSubscribed }, `User is ${isSubscribed ? "" : "not"} subscribed to this channel`));
    })
    getSubscribersCount = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        if (!channelId) {
            throw new ApiError(400, "Channel Id is required");
        }
        const subscribersCount = await Subscription.countDocuments({ channelId: new mongoose.Types.ObjectId(channelId) });
        return res.status(200).json(new ApiResponse(200, { subscribersCount }, "Subscribers count fetched successfully"));
    })
}

export default new SubscriptionController();