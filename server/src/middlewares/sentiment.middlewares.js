import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function detectEmotion(req, res, next) {
    const { content } = req.body;
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Analyze the sentiment of this comment: "${content}" and return if it's positive, negative, or neutral. only response with only one of these three options.`,
                },
            ],
            model: "llama3-8b-8192",
        });
        req.body.sentiment = response.choices[0].message.content || "neutral";
        next();
    } catch (error) {
        console.error(error.message)
    }
}
