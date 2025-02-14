import mongoose from "mongoose";
import { Post } from "./post.js";

const videoSchema = new mongoose.Schema({
    videoUrl: { type: String, required: true },
    videoDuration: { type: Number, required: true },
    thumbnailUrl: { type: String }
});

export const VideoPost = Post.discriminator("video", videoSchema);
