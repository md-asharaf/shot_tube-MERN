import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createTweet);

router.route("/:userId").get(getUserTweets);

router.route("/:tweetId/update").patch(updateTweet);

router.route("/:tweetId/delete").delete(deleteTweet);

export default router;