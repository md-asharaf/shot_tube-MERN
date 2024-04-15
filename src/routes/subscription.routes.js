import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { SubscriptionC } from "../controllers/subscription.controllers.js";
const router = Router();

router.route("/:channelId/toggle-subscription").post(verifyJWT, SubscriptionC.toggleSubscription);

router.route("/:channelId/subscribers").get(SubscriptionC.getUserChannelSubscribers);

router.route("/:subscriberId/subscriptions").get(SubscriptionC.getSubscribedChannels);

export default router;