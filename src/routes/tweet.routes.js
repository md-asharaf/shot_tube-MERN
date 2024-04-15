import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { TweetC } from "../controllers/tweet.controllers.js";

const router = Router();

router.route("/:userId").get(TweetC.getUserTweets);

router.route("/create").post(verifyJWT, TweetC.createTweet);

router.route("/:tweetId/update").patch(verifyJWT, TweetC.updateTweet);

router.route("/:tweetId/delete").delete(verifyJWT, TweetC.deleteTweet);

export default router;