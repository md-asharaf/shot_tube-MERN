import Router from "express";
import { verifyJWT } from "../middlewares/auth.js";
import tweetControllers from "../controllers/tweet.js";
import { limiter } from "../utils/rate-limiter.js";

const router = Router();

router.get("/all-tweets/:userId", tweetControllers.getUserTweets);
router.post("/create-tweet",limiter(10), verifyJWT, tweetControllers.createTweet);
router.use(verifyJWT);
router.patch("/update-tweet/:tweetId", tweetControllers.updateTweet);
router.delete("/delete-tweet/:tweetId", tweetControllers.deleteTweet);

export default router;