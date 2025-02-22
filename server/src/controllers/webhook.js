import { Video } from "../models/video.js";
import { Short } from "../models/short.js";
import { getCache, removeCache, setCache } from "../lib/redis.js";
class WebhookController {
    updateTranscodingStatus = async (req) => {
        try {
            const { resolution, id } = req.body;
            const cache = await getCache(id);
            cache[resolution] = true;
            //check if all true
            for (const key in cache) {
                if (!cache[key]) {
                    setCache(id, cache);
                    return { success: true, message: `${resolution} resolution cached successfully` }
                }
            }
            //all true
            await removeCache(id);
            const document = await Video.findById(id) || await Short.findById(id);
            document.sourceStatus = "READY";
            await document.save();
            return { success: true, message: "Transcription updated successfully" }
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message }
        }
    }
    updateTranscriptionStatus = async (req) => {
        try {
            const { status, id } = req.body;
            const document = await Video.findById(id) || await Short.findById(id);
            document.subtitleStatus = status;
            await document.save();
            return { success: true, message: "Transcoding updated successfully" }
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message }
        }
    }
    updateTitleAndDescStatus = async (req) => {
        try {
            const { title, description, id } = req.body;
            const document = await Video.findById(id) || await Short.findById(id);
            document.title = title;
            document.description = description;
            await document.save();
            return { success: true, message: "Title and Description updated successfully" }
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message }
        }
    }
}


export const webhookController = new WebhookController();