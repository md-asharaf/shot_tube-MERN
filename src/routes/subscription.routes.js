import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
} from "../controllers/subscription.controllers.js";
const router = Router();

router.route("/:channelId/toggle-subscription").post(verifyJWT, toggleSubscription);

router.route("/subscribers").get(getUserChannelSubscribers);

router.route("/subscriptions").get(getSubscribedChannels);

export default router;