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

export const putObjectUrl = async (
    bucket: string,
    key: string,
    contentType: string
) => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const getObjectUrl = async (bucket: string, key: string) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
};

export const uploadFile = async (file: File) => {
    const contentType = file.type || "application/octet-stream";
    const fileExtension = file.name.split(".").pop();
    const key = `uploads/user-uploads/${Date.now()}.${fileExtension}`;
    try {
        const url = await putObjectUrl(
            "shot-tube-videos",
            key,
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
        return `https://shot-tube-videos.s3.amazonaws.com/${key}`;
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
};

export const downloadImageAndUploadToS3 = async (
    imageUrl: string,
    fileName: string
) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });

        const fileType =
            response.headers["content-type"] || "application/octet-stream";

        const blob = new Blob([response.data], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });

        const s3Url = await uploadFile(file);
        return s3Url;
    } catch (error) {
        console.error("Error downloading or uploading image:", error);
    }
};

