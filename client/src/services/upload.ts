import { PartETag } from "@/interfaces";
import axios from "@/lib/axios";
class UploadService {
    initiateMultipartUpload = async (
        fileKey: string,
        contentType: string,
        totalParts: number
    ) =>
        await axios.post("/uploads/start-multipart-upload", {
            fileKey,
            contentType,
            totalParts,
        });
    completeMultiPartUpload = async (
        uploadId: string,
        fileKey: string,
        partETags: PartETag[]
    ) =>
        await axios.post("/uploads/complete-multipart-upload", {
            uploadId,
            fileKey,
            partETags,
        });
    abortMultiPartUpload = async (uploadId: string, fileKey: string) =>
        await axios.post("/uploads/abort-multipart-upload", {
            uploadId,
            fileKey,
        });
    getPutObjectPresignedUrl = async (fileKey: string, contentType: string) =>
        await axios.post("/uploads/generate-presigned-url", {
            fileKey,
            contentType,
        });
}

export const uploadService = new UploadService();
