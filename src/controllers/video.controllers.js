import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { v2 as cloudinary } from "cloudinary";
import Video from "../models/video.models.js";

// controller to publish a video
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { userId } = req.user._id;
    if (!req.files?.length) {
        throw new ApiError(400, "Please upload a video file and thumbnail")
    }
    const localVideoPath = req.files.video.path;
    const localThumbNailPath = req.files.thumbnail.path;

    //upload to cloudinary
    const videoFile = await cloudinary.uploader.upload(localVideoPath);
    const thumbNail = await cloudinary.uploader.upload(localThumbNailPath);
    if (!videoFile || !thumbNail) {
        throw new ApiError(500, "Failed to upload video or thumbnail")
    }
    //save to database
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbNail: thumbNail.url,
        duration: videoFile.duration,
        title,
        description,
        userId
    })
    if (!video) {
        throw new ApiError(500, "Failed to publish video")
    }

    return res.status(200).json(new ApiResponse(200, { video }, "Video published successfully"))
})

// controller to delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Please provide videoId")
    }
    await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

// controller to update a video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description = "" } = req.body;
    if (!title) {
        throw new ApiError(400, "Please provide title")
    }
    const video = await Video.findByIdAndUpdate(videoId, { title, description }, { new: true })
    if (!video) {
        throw new ApiError(500, "Failed to update video")
    }
    return res.status(200).json(new ApiResponse(200, { video }, "Video updated successfully"))
})
// controller to toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Please provide videoId")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(new ApiResponse(200, { video }, `Video ${isPublished ? "published" : "unpublished"} successfully`))
})

export { publishVideo, deleteVideo, updateVideo, togglePublishStatus }