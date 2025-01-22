import {Router} from 'express';
import NotificationController from '../controllers/notification.js';
import {verifyJWT} from '../middlewares/auth.js';
const router = Router();

router.get('/all-notifications',verifyJWT, NotificationController.getAllNotifications);

export default router;