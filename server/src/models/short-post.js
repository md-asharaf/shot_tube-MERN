import mongoose from "mongoose";
import { Post } from "./post.js";

const shortSchema = new mongoose.Schema({
    shortUrl: { type: String, required: true },
    shortDuration: { type: Number, required: true },
    thumbnailUrl: { type: String }
});

export const ShortPost = Post.discriminator("short", shortSchema);
