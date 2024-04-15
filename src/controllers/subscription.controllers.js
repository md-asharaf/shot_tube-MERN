import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";

class SubscriptionC {

    // controller to toggle subscription to a channel
    static toggleSubscription = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        const subscriberId = req.user?._id;
        if (!channelId || !subscriberId) {
            throw new ApiError(400, "Channel Id and subscriber Id are required")
        }
        let subscription = await Subscription.findOne({ channelId: new mongoose.Types.ObjectId(channelId), subscriberId: new mongoose.Types.ObjectId(subscriberId) });
        if (subscription) {
            await Subscription.findByIdAndDelete(subscription._id, { new: true });
            subscription = null;
        }
        else {
            subscription = await Subscription.create({ channelId, subscriberId });
        }
        return res.status(201).json(new ApiResponse(201, subscription, `${!subscription ? "Unsubscribed" : "Subscribed"} successfully`));
    })

    // controller to return subscriber list of a channel
    static getUserChannelSubscribers = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        if (!channelId) {
            throw new ApiError(400, "Channel Id is required");
        }
        console.log(channelId, "\n")
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

    // controller to return channel list to which user has subscribed
    static getSubscribedChannels = asyncHandler(async (req, res) => {
        const { subscriberId } = req.params;
        if (!subscriberId) {
            throw new ApiError(400, "Subscriber Id is required");
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
        return res.status(200).json(new ApiResponse(200, { subscribedChannelsCount: subscribedChannels.length, subscribedChannels }, "Subscribed channels fetched successfully"));
    })
}

export { SubscriptionC }