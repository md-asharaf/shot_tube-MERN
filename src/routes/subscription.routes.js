import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    toggleSubscription,
    getSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js";
const router = Router();

router.use(verifyJWT);
router.route("/:channelId/toggle-subscription").post(verifyJWT, toggleSubscription);

router.route("/subscribers").get(getSubscribers);

router.route("/subscriptions").get(getSubscribedChannels);

export default router;