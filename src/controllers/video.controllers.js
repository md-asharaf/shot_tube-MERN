import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { v2 as cloudinary } from "cloudinary";
import { Video } from "../models/video.models.js";

// controller to publish a video
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id;
    if (!req.files?.video || !req.files?.thumbnail) {
        throw new ApiError(400, "Please provide video and thumbnail")
    }
    const localVideo = req.files.video[0];
    const localThumbNail = req.files.thumbnail[0];
    console.log(localVideo)
    const existedVideo = await cloudinary.search.expression(`filename:${encodeURIComponent(localVideo.filename)}`).execute();
    if (existedVideo.total_count) {
        //upload to cloudinary
        throw new ApiError(400, "Video already exists")
    }
    const videoFile = await cloudinary.uploader.upload(localVideo.path, {
        resource_type: "video"
    });
    const thumbNail = await cloudinary.uploader.upload(localThumbNail.path, {
        resource_type: "image"
    });
    if (!videoFile || !thumbNail) {
        throw new ApiError(500, "Failed to upload video or thumbnail")
    }
    console.log(videoFile, thumbNail)
    //save to database
    const video = await Video.create({
        videoFile: { url: videoFile.url, public_id: videoFile.public_id },
        thumbNail: { url: thumbNail.url, public_id: thumbNail.public_id },
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
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "invalid videoId")
    }
    await cloudinary.uploader.destroy(video.videoFile.public_id);
    await Video.findByIdAndDelete(video._id);
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

// controller to update a video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description = "", thumbnail } = req.body;
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
    const video = await Video.findByIdAndUpdate(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(new ApiResponse(200, { video }, `Video ${isPublished ? "published" : "unpublished"} successfully`))
})

export { publishVideo, deleteVideo, updateVideo, togglePublishStatus }