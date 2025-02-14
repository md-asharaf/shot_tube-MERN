import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/handler.js';
import { abortMultipartUpload, completeMultipartUpload, putObjectUrl, startMultipartUploadAndGenerateUrls } from '../lib/s3-client.js';

class UploadController {
  startMultipartUpload = asyncHandler(async (req, res) => {
    const { fileKey, contentType, totalParts } = req.body;
    if (!fileKey || !contentType || !totalParts) {
      throw new ApiError(400, 'File key and total parts are required');
    }
    const { uploadId, presignedUrls } = await startMultipartUploadAndGenerateUrls(fileKey, contentType, totalParts);
    return res.status(200).json(new ApiResponse(200, { uploadId, presignedUrls }, 'Multipart upload initiated successfully'));
  })
  completeMultipartUpload = asyncHandler(async (req, res) => {
    const { uploadId, fileKey, partETags } = req.body;

    if (!uploadId || !fileKey || !partETags) {
      throw new ApiError(400, 'Missing required fields');
    }

    await completeMultipartUpload(uploadId, fileKey, partETags);
    return res.status(200).json(new ApiResponse(200, null, 'Multipart Upload completed successfully'));
  })
  abortMultipartUpload = asyncHandler(async (req, res) => {
    const { uploadId, fileKey } = req.body;

    if (!uploadId || !fileKey) {
      throw new ApiError(400, 'Upload ID and file key are required');
    }
    await abortMultipartUpload(uploadId, fileKey);
    return res.status(200).json(new ApiResponse(200, null, 'Multipart upload aborted successfully'));
  })
  generatePresignedUrl = asyncHandler(async (req, res) => {
    const { fileKey, contentType } = req.body;
    if (!fileKey || !contentType) {
      throw new ApiError(400, 'File key and Content Type are required');
    }
    const url = await putObjectUrl(fileKey, contentType);
    return res.status(200).json(new ApiResponse(200, { url }, 'Presigned URL generated successfully'));
  })
}

export const uploadController = new UploadController();

