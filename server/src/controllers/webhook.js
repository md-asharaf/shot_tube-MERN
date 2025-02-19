import { Video } from "../models/video.js";
class WebhookController {
    updateTranscriptionStatus = async (req) => {
        try {
            const { status,id } = req.body;
            await Video.findByIdAndUpdate(id, { $set: { subtitleStatus:status } });
            return { success: true, message: "Transcription updated successfully" }
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message}
        }
    }
    updateTranscodingStatus = async (req) => {
        try {
            const { status,id } = req.body;
            await Video.findByIdAndUpdate(id, { $set: { sourceStatus: status } });
            return { success: true, message: "Transcoding updated successfully" }
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message}
        }
    }
    updateTitleAndDescStatus = async (req) => {
        try {
            const { title ,description,id } = req.body;
            await Video.findByIdAndUpdate(id, { $set: { title,description } });
            return { success: true, message: "Title and Description updated successfully" }
        } catch (error) {
            console.log(error)
            return { success: false, message: error.message}
        }
    }
}


export const webhookController = new WebhookController();