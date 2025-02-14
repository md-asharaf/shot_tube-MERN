import { verifyJWT } from "../middlewares/auth.js";
import { subscriptionController } from "../controllers/subscription.js";
import { Router } from "express";
import { limiter } from "../utils/rate-limiter.js";
const router = Router();


router.get("/subscribers/:channelId", subscriptionController.getSubscribers);
router.get("/subscribers-count/:channelId", subscriptionController.getSubscribersCount);
router.get("/subscribed-channels/:subscriberId", subscriptionController.getSubscribedChannels);
router.get("/is-subscribed/:channelId", verifyJWT, subscriptionController.isSubscribed);
router.post("/toggle-subscription/:channelId", limiter(10), verifyJWT, subscriptionController.toggleSubscription);

export const subscriptionRoutes = router;