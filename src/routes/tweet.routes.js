import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controllers.js";

const router = Router();

router.route("/:userId").get(getUserTweets);

router.route("/create").post(verifyJWT, createTweet);

router.route("/:tweetId/update").patch(verifyJWT, updateTweet);

router.route("/:tweetId/delete").delete(verifyJWT, deleteTweet);

export default router;