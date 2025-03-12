import mongoose from "mongoose";
import { Post } from "./post.js";

const videoSchema = new mongoose.Schema({
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true }
});

export const VideoPost = Post.discriminator("video", videoSchema);
