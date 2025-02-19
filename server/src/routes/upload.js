import { uploadController } from '../controllers/upload.js';
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.js';
const router = Router();
router.post('/generate-presigned-url', (req, res, next) => {
    const { type } = req.query;
    if (type === 'noauth') {
        return uploadController.generatePresignedUrl(req, res);
    }
    next();
}, verifyJWT, uploadController.generatePresignedUrl);
router.use(verifyJWT);
router.post('/start-multipart-upload', uploadController.startMultipartUpload);

router.post('/complete-multipart-upload', uploadController.completeMultipartUpload);


router.post('/abort-multipart-upload', uploadController.abortMultipartUpload);

export const uploadRoutes = router;