import mongoose from "mongoose";
import { Post } from "./post.js";

const quizSchema = new mongoose.Schema({
    pollOptions: { type: [String], required: true },
    correctOption: { type: Number, required: true },
    quizExplanation: { type: String },
});

export const QuizPost = Post.discriminator("quiz", quizSchema);
