import Router from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import tweetControllers from "../controllers/tweet.controllers.js";

const router = Router();

router.get("/all-tweets/:userId", tweetControllers.getUserTweets);
router.post("/create-tweet", verifyJWT, tweetControllers.createTweet);
router.patch("/update-tweet/:tweetId", verifyJWT, tweetControllers.updateTweet);
router.delete("/delete-tweet/:tweetId", verifyJWT, tweetControllers.deleteTweet);

export default router;