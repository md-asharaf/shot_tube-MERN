import mongoose from "mongoose";
import { Post } from "./post.js";

const imagePollSchema = new mongoose.Schema({
    pollOptions: { type: [String], required: true },
    images: { type: [String], required: true }
});

export const ImagePollPost = Post.discriminator("image poll", imagePollSchema);
