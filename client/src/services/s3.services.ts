import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import AWS from "aws-sdk";
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
        const url = await getSignedUrl(s3Client, command);
        return url;
    };
    getObjectUrl = async (bucket: string, key: string) => {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command);
        console.log("presigned url: ", url);
        return url;
    };
    uploadFile = async (file: File) => {
        const filename = file.name;
        const contentType = file.type;
        console.log("filename", filename);
        console.log("contentType", contentType);
        try {
            const url = await this.putObjectUrl("shot-tube-videos", filename, contentType);
            const response = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": contentType,
                },
            });
            if(!response.ok){
                throw new Error("an error occurred")
            }
            return await this.getObjectUrl("shot-tube-videos", `uploads/user-uploads/${filename}`);
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    };
    deleteObjectUrl
}
export default new S3();
