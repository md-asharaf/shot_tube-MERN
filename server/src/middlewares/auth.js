import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/handler.js";
import { validateIdToken } from "../lib/firebase-admin.js"
export const validateAccessToken = async (accessToken) => {
    try {
        const { _id, email, fullname, username } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        return await User.findOne({ _id, email, fullname, username });
    } catch (error) {
        throw error;
    }
};
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const { idToken, accessToken } = req.cookies;
    if (!idToken && !accessToken) {
        throw new ApiError(401, "You are not authorized to perform this action. Please log in and try again.");
    }
    const user = (idToken && await validateIdToken(idToken)) || (accessToken && await validateAccessToken(accessToken)) || null;
    if (!user) {
        throw new ApiError(401, "Your session has expired. Please log in again to continue.");
    }
    req.user = user;
    next();
});

