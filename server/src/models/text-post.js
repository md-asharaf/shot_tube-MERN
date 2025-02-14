import mongoose from "mongoose";
import { Post } from "./post.js";
const textPostSchema = new mongoose.Schema({});

export const TextPost = Post.discriminator("text", textPostSchema);