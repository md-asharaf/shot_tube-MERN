import { asyncHandler } from "../utils/handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
class VideoC {
    // controller to publish a video
    publishVideo = asyncHandler(async (req, res) => {
        try {
            //get title and description from request body
            const { title, description,video,thumbnail,duration,subtitle} = req.body;
            //get user id from request user object
            const userId = req.user?._id;
            //check if title and description are provided
            if (!title || !description || !video || !thumbnail || !duration) {
                throw new ApiError(400, "please provide title, description, video, thumbnail and duration")
            }
            const newVideo = await Video.create({
                video,
                thumbnail,
                duration,
                title,
                description,
                subtitle,
                userId
            })
            if (!newVideo) {
                throw new ApiError(500, "Failed to publish video")
            }
            return res.status(200).json(new ApiResponse(200, newVideo, "Video published successfully"))
        } catch (error) {
            console.error(error.message)
        }
    })

    // controller to delete a video
    deleteVideo = asyncHandler(async (req, res) => {
        //get video id from request params
        const { videoId } = req.params;
        const userId = req.user?._id;
        //find video by id
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(400, "invalid videoId")
        }
        if (video.userId.toString() !== userId.toString()) {
            throw new ApiError(400, "You are not authorized to delete this video")
        }
        //delete video from database
        await Video.findByIdAndDelete(video._id);
        return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
    })
    // controller to update a video
    updateVideo = asyncHandler(async (req, res) => {
        try {
            //get video id from request params 
            const { videoId } = req.params;
            const userId = req.user?._id;
            //get title, description from request body
            const { title, description } = req.body;
            //check if title or description or thumbnail is provided
            if (!title && !description) {
                throw new ApiError(400, "Please provide title or description")
            }
            //find video by id
            const video = await Video.findById(videoId);
            if (!video) {
                throw new ApiError(500, "Invalid videoId")
            }
            if (video.userId.toString() !== userId.toString()) {
                throw new ApiError(400, "You are not authorized to update this video")
            }
            //update video
            if (title) video.title = title;
            if (description) video.description = description;
            //save video
            await video.save({ validateBeforeSave: false });
            return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
        } catch (error) {
            console.error("ERROR: ", error.message)
        }
    })
    // controller to toggle publish status of a video
    togglePublishStatus = asyncHandler(async (req, res) => {
        //get video id from request params
        const { videoId } = req.params;
        //find video by id 
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found")
        }
        //toggle publish status
        video.isPublished = !video.isPublished;
        //save the video
        await video.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, {}, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
    })

    getAllVideos = asyncHandler(async (req, res) => {
        const { page, limit } = req.query;
        try {
            const videos = await Video.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "creator",
                    }
                },
                {
                    $addFields: {
                        creator: {
                            $first: "$creator"
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $skip: page * Number(limit)
                },
                {
                    $limit: Number(limit)
                },
                {
                    $project: {
                        userId: 0,
                        isPublished: 0,
                        __v: 0,
                    }
                }
            ])
            return res.status(200).json(new ApiResponse(200, videos, "All videos fetched successfully"))
        } catch (error) {
            console.error("ERROR: ", error.message)
        }
    })

    getSingleVideo = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const video = await Video.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(videoId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "creator"
                    }
                }, {
                    $addFields: {
                        creator: {
                            $first: "$creator"
                        }
                    }
                }, {
                    $project: {
                        userId: 0,
                        isPublished: 0,
                        __v: 0
                    }
                }
            ]
        )
        return res.status(200).json(new ApiResponse(200, video[0], "Video fetched successfully"))
    })
    getUserVideos = asyncHandler(async (req, res) => {
        const { userId } = req.params;
        try {
            const videos = await Video.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "creator",
                    }
                },
                {
                    $addFields: {
                        creator: {
                            $first: "$creator"
                        }
                    }
                }, {
                    $project: {
                        userId: 0,
                        isPublished: 0,
                        __v: 0,
                    }
                }, {
                    $sort: {
                        createdAt: -1
                    }
                }
            ])
            return res.status(200).json(new ApiResponse(200, videos, "this channel's all videos fetched successfully"))
        } catch (error) {
            console.error("ERROR: ", error.message)
        }
    })

    getVideosByQuery = asyncHandler(async (req, res) => {

        const { query } = req.params;
        //query will be parameter
        try {
            const videos = await Video.aggregate([
                {
                    $match: {
                        $or: [
                            {
                                title: {
                                    $regex: query,
                                    $options: "i"
                                }
                            },
                            {
                                description: {
                                    $regex: query,
                                    $options: "i"
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "creator",
                    }
                },
                {
                    $addFields: {
                        creator: {
                            $first: "$creator"
                        }
                    }
                },
                {
                    $project: {
                        userId: 0,
                        isPublished: 0,
                        __v: 0,
                    }
                }, {
                    $sort: {
                        createdAt: -1
                    }
                }
            ])
            return res.status(200).json(new ApiResponse(200, videos, "All videos by search query fetched successfully"))
        } catch (error) {
            console.error("ERROR: ", error.message)
        }
    })

    getRecommendedVideos = asyncHandler(async (req, res) => {
        try {
            const { _id: userId } = req.user;
            const { videoId } = req.params;

            // Find the current video
            const currentVideo = await Video.findById(videoId);
            if (!currentVideo) {
                return res.status(404).json({ message: 'Video not found' });
            }

            // Fetch user's watch history
            const user = await User.findById(userId).populate('watchHistory');
            const watchedVideoIds = user.watchHistory.map(video => video._id);

            // Hybrid Recommendation Pipeline
            const recommendations = await Video.aggregate([
                {
                    $match: {
                        // Exclude current video and already watched videos
                        _id: {
                            $nin: [videoId, ...watchedVideoIds]
                        },
                        isPublished: true
                    }
                },
                // Content-Based: Similar to current video
                {
                    $addFields: {
                        contentScore: {
                            $size: {
                                $setIntersection: [
                                    { $split: [{ $toLower: "$title" }, " "] },
                                    { $split: [{ $toLower: currentVideo.title }, " "] }
                                ]
                            }
                        }
                    }
                },
                // Collaborative: Consider videos from same creators of watched videos
                {
                    $addFields: {
                        collaborativeScore: {
                            $cond: [
                                { $in: ["$userId", user.watchHistory.map(v => v.userId)] },
                                5, // Boost score for videos from creators of watched videos
                                0
                            ]
                        }
                    }
                },
                // Popularity Boost
                {
                    $addFields: {
                        popularityScore: {
                            $divide: [
                                "$views",
                                { $max: [1, "$views"] } // Prevent division by zero
                            ]
                        }
                    }
                },
                // Combine Scoring
                {
                    $addFields: {
                        totalScore: {
                            $add: [
                                { $multiply: ["$contentScore", 2] },   // Content similarity weight
                                { $multiply: ["$collaborativeScore", 3] }, // Collaborative filtering weight
                                { $multiply: ["$popularityScore", 1.5] }  // Popularity weight
                            ]
                        }
                    }
                },
                // Sort by total score
                { $sort: { totalScore: -1 } },
                // Add some randomness
                { $sample: { size: 5 } }, // Random selection among top recommendations
                // Lookup creator details
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'creator'
                    }
                },
                { $unwind: '$creator' },
                // Final limit
                { $limit: 10 }
            ]);

            // If not enough recommendations, add truly random videos
            if (recommendations.length < 10) {
                const randomVideos = await Video.aggregate([
                    {
                        $match: {
                            _id: {
                                $nin: [
                                    videoId,
                                    ...watchedVideoIds,
                                    ...recommendations.map(r => r._id)
                                ]
                            },
                            isPublished: true
                        }
                    },
                    { $sample: { size: 10 - recommendations.length } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'creator'
                        }
                    },
                    { $unwind: '$creator' },
                ]);

                recommendations.push(...randomVideos);
            }

            return res.status(200).json(new ApiResponse(200, recommendations, 'Recommended videos fetched successfully'));
        } catch (error) {
            console.error('Recommendation error:', error);
        }
    })

    increaseViews = asyncHandler(async (req, res) => {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);
        video.views++;
        await video.save({ validateBeforeSave: false })
        return res.status(200).json(new ApiResponse(200, video, "successfully video's views increased"))
    })
}

export default new VideoC();