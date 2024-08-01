import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";
import { Cloudinary } from "../utils/cloudinary.js";
class VideoC {
    // controller to publish a video
    publishVideo = asyncHandler(async (req, res) => {
        try {
            //get title and description from request body
            const { title, description } = req.body;
            //get user id from request user object
            const userId = req.user?._id;
            console.log(title, description, userId)
            //check if title and description are provided
            if (!title || !description) {
                throw new ApiError(400, "Please provide title and description")
            }
            //check if video and thumbnail files are provided
            if (!req.files || !req.files.video || !req.files.thumbnail || !req.files.video.length || !req.files.thumbnail.length) {
                return res.json(new ApiResponse(400, {}, "Please provide video and thumbnail files"))
            }
            //get video and thumbnail files
            const localVideo = req.files.video[0];
            const localThumbnail = req.files.thumbnail[0];
            //upload video and thumbnail on cloudinary
            // const output360 = localVideo.path.replace(".mp4", "_360p.mp4");
            // const output720 = localVideo.path.replace(".mp4", "_720p.mp4");
            // const output1080 = localVideo.path.replace(".mp4", "_1080p.mp4");
            // await transcodeVideo(localVideo.path, output360, "640x360");
            // await transcodeVideo(localVideo.path, output720, "1280x720");
            // await transcodeVideo(localVideo.path, output1080, "1920x1080");
            // const { video: url_360 } = await Cloudinary.upload(output360, "video");
            // const { video: url_720 } = await Cloudinary.upload(output720, "video");
            // const { video: url_1080, duration, public_id } = await Cloudinary.upload(output1080, "video");
            // if (!url_360 || !url_720 || !url_1080) {
            //     throw new ApiError(500, "Failed to upload video or thumbnail")
            // }
            // const _360m3u8 = output360.replace(".mp4", ".m3u8");
            // const _720m3u8 = output720.replace(".mp4", ".m3u8");
            // const _1080m3u8 = output1080.replace(".mp4", ".m3u8");
            // await generateHLSPlaylist(output360, _360m3u8);
            // await generateHLSPlaylist(output720, _720m3u8);
            // await generateHLSPlaylist(output1080, _1080m3u8);
            const { video, duration } = await Cloudinary.upload(localVideo.path, "video");
            const thumbnail = await Cloudinary.upload(localThumbnail.path, "image");
            //get duration of video
            //create video
            const videoo = await Video.create({
                videoFile: video,
                thumbnail,
                duration,
                title,
                description,
                userId
            })
            if (!video) {
                throw new ApiError(500, "Failed to publish video")
            }
            return res.status(200).json(new ApiResponse(200, videoo, "Video published successfully"))
        } catch (error) {
            console.log(error.message)
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
        //delete video from cloudinary
        await Cloudinary.delete(video.videoFile.public_id);
        await Cloudinary.delete(video.thumbnail.public_id);
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
            //get title, description and thumbnail from request body
            const { title, description } = req.body;
            const localThumbnailPath = req.file?.path || "";
            //check if title or description or thumbnail is provided
            if (!title && !description && !localThumbnailPath) {
                throw new ApiError(400, "Please provide title or description or thumbnail")
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
            //upload thumbnail if provided
            if (localThumbnailPath) {
                //upload thumbnail on cloudinary
                const thumbnail = await Cloudinary.upload(localThumbnailPath, "image");

                if (!thumbnail) {
                    throw new ApiError(500, "Failed to upload thumbnail")
                }
                let oldThumbnail = video.thumbnail;
                //update thumbnail
                video.thumbnail = thumbnail;
                //delete old thumbnail from cloudinary
                await Cloudinary.delete(oldThumbnail.public_id)
            }
            //save video
            await video.save({ validateBeforeSave: false });
            return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
        } catch (error) {
            console.log("ERROR: ", error.message)
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
            console.log("ERROR: ", error.message)
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
            console.log("ERROR: ", error.message)
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
            console.log("ERROR: ", error.message)
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