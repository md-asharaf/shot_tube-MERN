import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import SubscriptionC from "../controllers/subscription.controllers.js";
const router = Router();

router.post("/:channelId/toggle-subscription", verifyJWT, SubscriptionC.toggleSubscription);

router.get("/:channelId/subscribers", SubscriptionC.getUserChannelSubscribers);

router.get("/:subscriberId/subscriptions", SubscriptionC.getSubscribedChannels);

router.get("/:channelId", verifyJWT, SubscriptionC.isSubscribed);

router.get("/:channelId/subscribers-count", SubscriptionC.getSubscribersCount);

export default router;