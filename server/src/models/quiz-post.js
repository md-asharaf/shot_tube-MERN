import mongoose from "mongoose";
import { Post } from "./post.js";

const quizSchema = new mongoose.Schema({
    options: { type: [String], required: true },
    correct: { type: Number, required: true },
    explanation: { type: String },
});

export const QuizPost = Post.discriminator("quiz", quizSchema);
