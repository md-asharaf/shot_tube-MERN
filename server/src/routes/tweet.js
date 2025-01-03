import Router from "express";
import { verifyJWT } from "../middlewares/auth.js";
import tweetControllers from "../controllers/tweet.js";

const router = Router();

router.get("/all-tweets/:userId", tweetControllers.getUserTweets);
router.post("/create-tweet", verifyJWT, tweetControllers.createTweet);
router.patch("/update-tweet/:tweetId", verifyJWT, tweetControllers.updateTweet);
router.delete("/delete-tweet/:tweetId", verifyJWT, tweetControllers.deleteTweet);

export default router;