import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { asyncHandler } from "../utils/handler.js";
import { validateIdToken } from "../lib/firebase-admin.js"
export const validateAccessToken = async (accessToken) => {
    try {
        const { _id, email, fullname, username } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        return await User.findOne({ _id, email, fullname, username });
    } catch (error) {
        return null;
    }
};

export const validateAndRefreshToken = async (refreshToken, res) => {
    try {
        const { _id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(_id);

        if (user && user.refreshToken === refreshToken) {
            const newAccessToken = await user.generateAccessToken();
            const newRefreshToken = await user.generateRefreshToken();
            user.refreshToken = newRefreshToken;
            await user.save({ validateBeforeSave: false });

            const options = { httpOnly: true, secure: true, sameSite: "none" };
            res.cookie("accessToken", newAccessToken, options);
            res.cookie("refreshToken", newRefreshToken, options);

            return user;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const { idToken, accessToken, refreshToken } = req.cookies;
    req.user =
        (idToken && (await validateIdToken(idToken))) ||
        (accessToken && (await validateAccessToken(accessToken))) ||
        (refreshToken && (await validateAndRefreshToken(refreshToken, res))) ||
        null;
    return next();
});

