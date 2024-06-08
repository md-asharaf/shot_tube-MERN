import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import TweetC from "../controllers/tweet.controllers.js";

const router = Router();

router.get("/:userId", TweetC.getUserTweets);

router.post("/create", verifyJWT, TweetC.createTweet);

router.patch("/:tweetId/update", verifyJWT, TweetC.updateTweet);

router.delete("/:tweetId/delete", verifyJWT, TweetC.deleteTweet);

export default router;