import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { shortController } from "../controllers/short.js";
const router = Router();
router.get("/search-shorts", shortController.getShortsByQuery);
router.get("/random-short", shortController.getRandomShortId);
router.get("/recommended-shorts", shortController.getRecommendedShorts);
router.get("/user-shorts/:username", shortController.getShortsByUsername);
router.get("/liked-shorts", verifyJWT, shortController.getLikedShorts);
router.get("/:shortId", shortController.getShortById);
router.post("/increase-views/:shortId", shortController.increaseViews)
router.use(verifyJWT);
router.post("/publish-short", shortController.publishShort);
router.delete("/delete-short/:shortId", shortController.deleteShort);
router.patch("/update-short/:shortId", shortController.updateShortDetails);

export const shortRoutes = router;