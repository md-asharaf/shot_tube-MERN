import { verifyJWT } from "../middlewares/auth.js";
import subscriptionControllers from "../controllers/subscription.js";
import Router from "express";
import { limiter } from "../utils/rate-limiter.js";
const router = Router();


router.get("/subscribers/:channelId", subscriptionControllers.getSubscribers);
router.get("/subscribed-channels/:subscriberId", subscriptionControllers.getSubscribedChannels);
router.get("/is-subscribed/:channelId", verifyJWT, subscriptionControllers.isSubscribed);
router.get("/subscribers-count/:channelId", subscriptionControllers.getSubscribersCount);
router.post("/toggle-subscription/:channelId", limiter(10), verifyJWT, subscriptionControllers.toggleSubscription);

export default router;