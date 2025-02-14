import { asyncHandler } from "../utils/handler.js";
import { Notification } from "../models/notification.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
class NotificationController {
    getAllNotifications = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user?._id
        const notifications = await Notification.aggregatePaginate(Notification.aggregate([
            {
                $match: {
                    userId
                }
            }
        ]), { page, limit });
        return res.status(200).json(new ApiResponse(200, { notifications }, "Notifications fetched successfully"))
    })
    markAsRead = asyncHandler(async (req, res) => {
        const { createdAt } = req.query;
        if (!id) {
            throw new ApiError(400, "createdAt is required")
        }
        const userId = req.user?._id;
        await Notification.updateOne({ userId, createdAt }, { read: true });
        return res.status(200).json(new ApiResponse(200, null, "Notification marked as read"))
    })
    markAllAsRead = asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        await Notification.updateMany({ userId }, { read: true });
        return res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"))
    })
    deleteNotification = asyncHandler(async (req, res) => {
        const { createdAt } = req.query;
        const userId = req.user?._id;
        if (!createdAt) {
            throw new ApiError(400, "createdAt is required")
        }
        await Notification.deleteOne({ createdAt, userId });
        return res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"))
    })
}

export const notificationController = new NotificationController();