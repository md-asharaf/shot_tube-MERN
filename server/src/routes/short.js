import Router from "express";
import { verifyJWT } from "../middlewares/auth.js";
import shortControllers from "../controllers/short.js";
const router = Router();

router.get("/search-shorts", shortControllers.getShortsByQuery);
router.get("/recommended-shorts", shortControllers.getRecommendedShorts);
router.get("/user-shorts/:userId", shortControllers.getShortsByUserId);
router.get("/liked-shorts",verifyJWT, shortControllers.getLikedShorts);
router.get("/:shortId", shortControllers.getShortById);
router.post("/increase-views/:shortId", shortControllers.increaseViews)
router.use(verifyJWT);
router.post("/publish-short", shortControllers.publishShort);
router.delete("/delete-short/:shortId", shortControllers.deleteShort);
router.patch("/update-short/:shortId", shortControllers.updateShortDetails);

export default router;