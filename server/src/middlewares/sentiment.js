import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function detectEmotion(req, res, next) {
    const { content } = req.body;
    try {
        const result = await model.generateContent(
            `Analyze the sentiment of this comment: "${content}" and return if it's positive, negative, or neutral. Only respond with one of these three options. nothing extra.nothing less.`
        );
        
        req.body.sentiment = result.response.text().trim() || "neutral";
        next();
    } catch (error) {
        console.error(`Error in detectEmotion: ${error.message}`);
        throw new ApiError(500, "Error in detecting emotion");
    }
}