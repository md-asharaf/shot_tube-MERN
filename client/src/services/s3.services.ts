import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
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
    downloadImageAndUploadToS3= async (imageUrl, fileName)=>{
        try {
            // Step 1: Download the image as a Blob or Buffer
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            const fileType = response.headers["content-type"]; // Get the MIME type from response headers
    
            // Step 2: Convert to a File object
            const file = new File([response.data], fileName, { type: fileType });
    
            // Step 3: Upload the File to S3
            const s3Url = await this.uploadFile(file);
    
            console.log("File uploaded to S3 successfully:", s3Url);
            return s3Url; // Return the uploaded file's URL from S3
        } catch (error) {
            console.error("Error downloading or uploading image:", error);
            throw error;
        }
    }
}
export default new S3();
