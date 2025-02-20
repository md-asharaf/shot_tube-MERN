import { PartETag } from "@/interfaces";
import { v4 as uuidv4 } from "uuid";
import { uploadService } from "@/services/upload";
import axios from "axios";
export const downloadImageAndUploadToS3 = async (
    imageUrl: string,
    fileName: string
): Promise<string> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const fileType = response.headers.get("content-type") || "application/octet-stream";
        const fileExtension = fileName.split(".").pop() || "bin";
        const file = new File([new Blob([arrayBuffer], { type: fileType })], fileName, { type: fileType });
        const fileKey = `uploads/user-uploads/${uuidv4()}.${fileExtension}`;
        const { url } = await uploadService.getPutObjectPresignedUrl(fileKey, fileType,"noauth");
        await uploadToPresignedUrl(url, file);
        return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileKey}`;
    } catch (error) {
        throw error;
    }
};

export const uploadToPresignedUrl = async (
    presignedUrl: string,
    fileOrPart: File | Blob,
    controller?: AbortController,
    onProgress?: (progress: number) => void
) => {
    try {
        const response = await axios.put(presignedUrl, fileOrPart, {
            signal: controller?.signal,
            headers: {
                "Content-Type": fileOrPart.type || "application/octet-stream",
            },
            onUploadProgress(progressEvent) {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (onProgress) {
                        onProgress(percentCompleted);
                    }
                }
            },
        });

        const eTag = response.headers["etag"];
        return eTag;
    } catch (error) {
        throw error;
    }
};


export const uploadAllParts = async (
    presignedUrls: string[],
    file: File | Blob,
    setOverAllProgress: (progress: number) => void
) => {
    const totalParts = 100;
    const partSize = Math.ceil(file.size / totalParts);
    const partETags:PartETag[] = [];
    try {
        for (let partNumber = 0; partNumber < totalParts; partNumber++) {
            const start = partNumber * partSize;
            const end = Math.min((partNumber + 1) * partSize, file.size);
            const filePart = file.slice(start, end);

            const eTag = await uploadToPresignedUrl(presignedUrls[partNumber], filePart);
            setOverAllProgress((partNumber + 1));
            if (typeof eTag === "string") {
                partETags.push({ PartNumber: partNumber + 1, ETag: eTag });
            }
        }
        return partETags;
    } catch (error) {
        throw error;
    }
};