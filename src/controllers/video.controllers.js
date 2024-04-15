import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { Cloudinary } from "../utils/cloudinary.js";

class VideoC {
    // controller to publish a video
    static publishVideo = asyncHandler(async (req, res) => {
        //get title and description from request body
        const { title, description } = req.body;
        //get user id from request user object
        const userId = req.user?._id;
        //check if title and description are provided
        if (!title || !description) {
            throw new ApiError(400, "Please provide title and description")
        }
        //check if video and thumbnail files are provided
        if (!req.files || !req.files.video || !req.files.thumbnail || !req.files.video.length || !req.files.thumbnail.length) {
            throw new ApiError(400, "Please provide video and thumbnail files")
        }
        //get video and thumbnail files
        const localVideo = req.files.video[0];
        const localThumbNail = req.files.thumbnail[0];
        /*
            await cloudinary.search.expression(encodeURIComponent(`resource_type:video AND filename:${localVideo.filename}`)).execute().then(result => console.log(result.total_count)).catch(err => console.log(err));
            if (existedVideo.total_count) {
                //upload to cloudinary
                throw new ApiError(400, "Video already exists")
            }
        */
        //upload video and thumbnail on cloudinary
        let videoFile = await Cloudinary.upload(localVideo.path, "video");
        const thumbNail = await Cloudinary.upload(localThumbNail.path, "image");
        if (!videoFile || !thumbNail) {
            throw new ApiError(500, "Failed to upload video or thumbnail")
        }
        //get duration of video
        const duration = videoFile.duration;
        videoFile = videoFile.video;
        //create video
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
    static deleteVideo = asyncHandler(async (req, res) => {
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
        await Cloudinary.delete(video.thumbNail.public_id);
        //delete video from database
        await Video.findByIdAndDelete(video._id);
        return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
    })

    // controller to update a video
    static updateVideo = asyncHandler(async (req, res) => {
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
                const thumbNail = await Cloudinary.upload(localThumbnailPath, "image");

                if (!thumbNail) {
                    throw new ApiError(500, "Failed to upload thumbnail")
                }
                let oldThumbNail = video.thumbNail;
                //update thumbnail
                video.thumbNail = thumbNail;
                //delete old thumbnail from cloudinary
                await Cloudinary.delete(oldThumbNail.public_id)
            }
            //save video
            await video.save({ validateBeforeSave: false });
            return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
        } catch (error) {
            console.log("ERROR: ", error.message)
        }
    })
    // controller to toggle publish status of a video
    static togglePublishStatus = asyncHandler(async (req, res) => {
        //get video id from request params
        const { videoId } = req.params;
        //find video by id 
        const video = await Video.findByIdAndUpdate(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found")
        }
        //toggle publish status
        video.isPublished = !video.isPublished;
        //save the video
        await video.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiResponse(200, { video }, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
    })
}

export { VideoC }