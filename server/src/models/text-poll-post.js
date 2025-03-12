import mongoose from "mongoose";
import { Post } from "./post.js";

const textPollSchema = new mongoose.Schema({
    options: { type: [String], required: true }
});

export const TextPollPost = Post.discriminator("text poll", textPollSchema);
