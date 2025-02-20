const AWS = require("aws-sdk");
const { AssemblyAI } = require("assemblyai");
const axios = require("axios");

const s3 = new AWS.S3();
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
});
async function getVideoMetadata(audioKey) {
    const params = {
        Bucket: "shot-tube-videos",
        Key: audioKey,
    };

    const data = await s3.headObject(params).promise();
    console.log("Metadata:", data.Metadata);
    return data.Metadata;
}
module.exports.handler = async (event) => {
    try {
        const eventBody = event.Records[0];
        const FILE_KEY = eventBody.s3.object.key;
        const INPUT_BUCKET = eventBody.s3.bucket.name;
        const audio_url = `https://${INPUT_BUCKET}.s3.amazonaws.com/${FILE_KEY}`;
        console.log(`Processing file: ${audio_url}`);
        const metadata = await getVideoMetadata(FILE_KEY);
        const id = metadata.shortid || metadata.videoid;
        // Request transcription
        let transcript;
        try {
            transcript = await client.transcripts.transcribe({ audio_url });
        } catch (err) {
            console.error("AssemblyAI Transcription Error:", err);
            await sendWebhook(id,"FAILED");
            return;
        }

        // Get VTT subtitles
        let vttfile;
        try {
            vttfile = await client.transcripts.subtitles(transcript.id, "vtt");
        } catch (err) {
            console.error("AssemblyAI Subtitle Error:", err);
            await sendWebhook(id,"FAILED");
            return;
        }

        // Upload to S3
        const splits = FILE_KEY.split('/');
        splits.pop();
        const outputKey = `${splits.join('/')}/subtitle.vtt`;
        const uploadParams = {
            Bucket: INPUT_BUCKET,
            Key: outputKey,
            Body: vttfile,
            ContentType: "text/vtt"
        };

        try {
            await s3.upload(uploadParams).promise();
            console.log(`Uploaded to s3://${INPUT_BUCKET}/${outputKey}`);
        } catch (err) {
            console.error("S3 Upload Error:", err);
            await sendWebhook(id,"FAILED");
            return;
        }

        // Notify webhook
        const fileUrl = `https://${INPUT_BUCKET}.s3.ap-south-1.amazonaws.com/${outputKey}`;
        await sendWebhook(id,"READY");
    } catch (err) {
        console.error("Unexpected Error:", err);
        await sendWebhook(id,"FAILED");
    }
};

// Send Webhook Notification
async function sendWebhook(id,status) {
    try {
        await axios.post(process.env.WEBHOOK_URL, { id, status });
        console.log(`Webhook sent: ${id}`);
    } catch (err) {
        console.error("Webhook Error:", err);
    }
}
