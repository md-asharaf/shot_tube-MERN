import uploadController from '../controllers/upload.js';
import Router from 'express';
const router = Router();

router.post('/start-multipart-upload', uploadController.startMultipartUpload);

router.post('/complete-multipart-upload', uploadController.completeMultipartUpload);

router.post('/generate-presigned-url', uploadController.generatePresignedUrl);

router.post('/abort-multipart-upload', uploadController.abortMultipartUpload);

export default router;