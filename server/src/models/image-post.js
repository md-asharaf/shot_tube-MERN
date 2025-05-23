import mongoose from "mongoose";
import { Post } from "./post.js";

const imagePostSchema = new mongoose.Schema({
    images: { type: [String], required: true },
});

export const ImagePost = Post.discriminator("image", imagePostSchema);
