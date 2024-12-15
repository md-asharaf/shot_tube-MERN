import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import TweetC from "../controllers/tweet.controllers.js";

const router = Router();

router.get("/all-tweets/:userId", TweetC.getUserTweets);
router.post("/create-tweet", verifyJWT, TweetC.createTweet);
router.patch("/update-tweet/:tweetId", verifyJWT, TweetC.updateTweet);
router.delete("/delete-tweet/:tweetId", verifyJWT, TweetC.deleteTweet);

export default router;