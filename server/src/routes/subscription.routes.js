import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import SubscriptionC from "../controllers/subscription.controllers.js";
const router = Router();


router.get("/subscribers/:channelId", SubscriptionC.getUserChannelSubscribers);
router.get("/subscribed-channels/:subscriberId", SubscriptionC.getSubscribedChannels);
router.get("/is-subscribed/:channelId", verifyJWT, SubscriptionC.isSubscribed);
router.get("/subscribers-count/:channelId", SubscriptionC.getSubscribersCount);
router.post("/toggle-subscription/:channelId", verifyJWT, SubscriptionC.toggleSubscription);

export default router;