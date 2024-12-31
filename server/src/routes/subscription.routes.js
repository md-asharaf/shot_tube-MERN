import { verifyJWT } from "../middlewares/auth.middlewares.js";
import subscriptionControllers from "../controllers/subscription.controllers.js";
import Router from "express";
const router = Router();


router.get("/subscribers/:channelId", subscriptionControllers.getUserChannelSubscribers);
router.get("/subscribed-channels/:subscriberId", subscriptionControllers.getSubscribedChannels);
router.get("/is-subscribed/:channelId", verifyJWT, subscriptionControllers.isSubscribed);
router.get("/subscribers-count/:channelId", subscriptionControllers.getSubscribersCount);
router.post("/toggle-subscription/:channelId", verifyJWT, subscriptionControllers.toggleSubscription);

export default router;