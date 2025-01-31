import Router from "express";
import { verifyJWT } from "../middlewares/auth.js";
import tweetControllers from "../controllers/tweet.js";
import { limiter } from "../utils/rate-limiter.js";

const router = Router();

router.get("/all-tweets/:userId", tweetControllers.getUserTweets);
router.post("/create-tweet",limiter(10), verifyJWT, tweetControllers.createTweet);
router.patch("/update-tweet/:tweetId", verifyJWT, tweetControllers.updateTweet);
router.delete("/delete-tweet/:tweetId", verifyJWT, tweetControllers.deleteTweet);

export default router;