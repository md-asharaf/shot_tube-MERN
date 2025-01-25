import {Router} from 'express';
import NotificationController from '../controllers/notification.js';
import {verifyJWT} from '../middlewares/auth.js';
const router = Router();

router.get('/all-notifications',verifyJWT, NotificationController.getAllNotifications);
router.patch('/mark-as-read',verifyJWT, NotificationController.markAsRead);
router.patch('/mark-all-as-read',verifyJWT, NotificationController.markAllAsRead);  
router.delete('/delete-notification',verifyJWT, NotificationController.deleteNotification);
export default router;