import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { v2 as cloudinary } from "cloudinary";
import { Video } from "../models/video.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

/****************DEBUGGING COMPLETED****************/

// controller to publish a video
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id;
    if (!title || !description) {
        throw new ApiError(400, "Please provide title and description")
    }
    console.log("REQ.FILES:  \n", req.files)
    if (!req.files || !req.files.video || !req.files.thumbnail || !req.files.video.length || !req.files.thumbnail.length) {
        throw new ApiError(400, "Please provide video and thumbnail files")
    }
    const localVideo = req.files.video[0];
    const localThumbNail = req.files.thumbnail[0];
    console.log(localVideo)


    // await cloudinary.search.expression(encodeURIComponent(`resource_type:video AND filename:${localVideo.filename}`)).execute().then(result => console.log(result.total_count)).catch(err => console.log(err));
    // if (existedVideo.total_count) {
    //     //upload to cloudinary
    //     throw new ApiError(400, "Video already exists")
    // }

    let videoFile = await uploadOnCloudinary(localVideo.path, "video");
    const thumbNail = await uploadOnCloudinary(localThumbNail.path, "image");
    if (!videoFile || !thumbNail) {
        throw new ApiError(500, "Failed to upload video or thumbnail")
    }
    const duration = videoFile.duration;
    videoFile = videoFile.video;
    //save to database
    const video = await Video.create({
        videoFile,
        thumbNail,
        duration,
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
    await deleteFromCloudinary(video.videoFile.public_id);
    await Video.findByIdAndDelete(video._id);
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

// controller to update a video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const localThumbnailPath = req.file?.path || "";

    console.log(title, description, localThumbnailPath)
    if (!title && !description && !localThumbnailPath) {
        throw new ApiError(400, "Please provide title or description or thumbnail")
    }
    const video = await Video.findByIdAndUpdate(videoId);
    if (!video) {
        throw new ApiError(500, "Failed to update video")
    }
    if (title) video.title = title;
    if (description) video.description = description;
    if (localThumbnailPath) {
        const thumbNail = await uploadOnCloudinary(localThumbnailPath, "image");
        if (!thumbNail) {
            throw new ApiError(500, "Failed to upload thumbnail")
        }
        let oldThumbNail = video.thumbNail;
        video.thumbNail = thumbNail;
        //delete old thumbnail
        await deleteFromCloudinary(oldThumbNail.public_id)
    }

    await video.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
})
// controller to toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findByIdAndUpdate(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, { video }, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
})

export { publishVideo, deleteVideo, updateVideo, togglePublishStatus }