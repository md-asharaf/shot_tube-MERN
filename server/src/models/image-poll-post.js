import mongoose from "mongoose";
import { Post } from "./post.js";

const imagePollSchema = new mongoose.Schema({
    options: {
        type: [
            {
                image: { type: String, required: true },
                text: { type: String, required: true }
            }
        ], required: true
    },
});

export const ImagePollPost = Post.discriminator("image poll", imagePollSchema);
