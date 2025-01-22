import { asyncHandler } from "../utils/handler.js";
import Notification from "../models/notification.js"
import { ApiResponse } from "../utils/ApiResponse.js";

class NotificationController {
    getAllNotifications = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user?._id
        const notifications = await Notification.aggregatePaginate(Notification.aggregate([
            {
                $match: {
                    userId
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $addFields: {
                    user: {
                        $first: "$user"
                    }
                }
            },
            {
                $project: {
                    userId: 0
                }
            }
        ]), { page, limit });
        return res.status(200).json(new ApiResponse(200, { notifications }, "Notifications fetched successfully"))
    })
}

export default new NotificationController();