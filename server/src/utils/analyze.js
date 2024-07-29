import Groq from "groq-sdk";
import { ApiResponse } from "./ApiResponse.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function detectEmotion(req, res) {
    const { comment } = req.body;
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Analyze the sentiment of this comment: "${comment}" and return if it's positive, negative, or neutral. only response with only one of these three options.`,
                },
            ],
            model: "llama3-8b-8192",
        });
        return res.status(200).json(new ApiResponse(200, response.choices[0].message.content, "Success"));
    } catch (error) {
        console.log(error.message)
    }
}
