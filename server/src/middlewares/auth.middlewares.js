import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, "../../serviceAccount.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken, idToken } = req.cookies;
    if (idToken) {
        const { email } = await admin.auth().verifyIdToken(idToken);
        req.user = await User.findOne({ email });
    }
    else if (accessToken) {
        const { _id, email, fullname, username } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findOne({ _id, email, fullname, username });
    }
    else if (refreshToken) {
        const { _id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(_id);
        if (!user) {
            throw new ApiError(400, "refresh token is invalid or expired")
        }
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: 10 * 60 * 60 * 1000,
            sameSite: "none"
        };
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        res
            .status(200)
            .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
                accessToken,
                refreshToken,
            }, "Access Token refreshed"))
        req.user = user;
    }
    else {
        throw new ApiError(401, "Unauthorized")
    }
    next();
});
