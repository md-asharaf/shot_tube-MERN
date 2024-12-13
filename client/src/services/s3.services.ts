import axios from "axios";
import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

class S3 {
    putObjectUrl = async (
        bucket: string,
        filename: string,
        contentType: string
    ) => {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: `uploads/user-uploads/${filename}`,
            ContentType: contentType,
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Set an expiration time
    };

    getObjectUrl = async (bucket: string, key: string) => {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command);
        return url;
    };

    uploadFile = async (file: File) => {
        const filename = file.name;
        const contentType = file.type || "application/octet-stream"; // Add fallback content type
        try {
            const url = await this.putObjectUrl(
                "shot-tube-videos",
                filename,
                contentType
            );
            const response = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": contentType,
                },
            });
            if (!response.ok) {
                console.error("Error uploading file:", response.statusText);
            }
            return `https://shot-tube-videos.s3.amazonaws.com/uploads/user-uploads/${filename}`;
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    downloadImageAndUploadToS3 = async (imageUrl: string, fileName: string) => {
        try {
            const response = await axios.get(imageUrl, {
                responseType: "arraybuffer", // Get binary data
            });

            const fileType =
                response.headers["content-type"] || "application/octet-stream";

            // Convert buffer to Blob/File (depends on environment)
            const blob = new Blob([response.data], { type: fileType });
            const file = new File([blob], fileName, { type: fileType });

            const s3Url = await this.uploadFile(file);
            return s3Url;
        } catch (error) {
            console.error("Error downloading or uploading image:", error);
        }
    };
}

export default new S3();
