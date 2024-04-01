import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;