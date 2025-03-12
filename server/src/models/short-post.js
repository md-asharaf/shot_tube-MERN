import mongoose from "mongoose";
import { Post } from "./post.js";

const shortSchema = new mongoose.Schema({
    short: { type: mongoose.Schema.Types.String, ref: "Short", required: true }
});

export const ShortPost = Post.discriminator("short", shortSchema);
