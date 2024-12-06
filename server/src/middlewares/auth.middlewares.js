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
    console.log('INSIDE VERIFYJWT');
    const { idToken, accessToken, refreshToken } = req.cookies;

    try {
        // 1. Check and validate `idToken`
        if (idToken) {
            try {
                const { email } = await admin.auth().verifyIdToken(idToken);
                req.user = await User.findOne({ email });
                if (req.user) {
                    console.log("Authenticated via ID Token");
                    return next();
                }
            } catch (error) {
                console.warn("ID Token validation failed:", error.message);
            }
        }

        // 2. Check and validate `accessToken`
        if (accessToken) {
            try {
                const { _id, email, fullname, username } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                req.user = await User.findOne({ _id, email, fullname, username });
                if (req.user) {
                    console.log("Authenticated via Access Token");
                    return next();
                }
            } catch (error) {
                console.warn("Access Token validation failed:", error.message);
            }
        }

        // 3. Check and validate `refreshToken`
        if (refreshToken) {
            try {
                const { _id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(_id);

                if (!user || user.refreshToken !== refreshToken) {
                    throw new ApiError(400, "Refresh token is invalid or expired");
                }

                // Refresh tokens and attach new tokens to the response
                const newAccessToken = await user.generateAccessToken();
                const newRefreshToken = await user.generateRefreshToken();
                user.refreshToken = newRefreshToken;
                await user.save({ validateBeforeSave: false });

                const options = { httpOnly: true, secure: true, maxAge: 10 * 60 * 60 * 1000, sameSite: "none" };
                res.cookie("accessToken", newAccessToken, options);
                res.cookie("refreshToken", newRefreshToken, options);

                req.user = user;
                console.log("Authenticated via Refresh Token and tokens refreshed");
                return next();
            } catch (error) {
                console.warn("Refresh Token validation failed:", error.message);
            }
        }

        // If all tokens fail, throw an error
        throw new ApiError(401, "Unauthorized - All tokens are invalid or expired");

    } catch (error) {
        console.error("Authentication Error:", error.message);
        next(error);
    }
});
