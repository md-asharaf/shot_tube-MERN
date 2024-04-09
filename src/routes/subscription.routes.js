import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js";
const router = Router();

router.use(verifyJWT);

router.route("/:channelId/toggle-subscription").post(toggleSubscription);

router.route("/:channelId/subscribers").get(getUserChannelSubscribers);

router.route("/:subscriberId/subscriptions").get(getSubscribedChannels);

export default router;