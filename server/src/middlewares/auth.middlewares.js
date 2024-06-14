import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import Auth from "../controllers/auth.controllers.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    const verifyRefreshToken = async (token) => {
        if (!token) {
            throw new ApiError(401, "both tokes are missing,please login to continue")
        }
        try {
            const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            const { accessToken, refreshToken } = await Auth.generateTokens(decodedToken._id);
            const options = {
                httpOnly: true,
                secure: true
            }
            req.user = await User.findById(decodedToken._id);
            res.cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options);
            next();
        } catch (error) {
            console.log("error in refresh token", error.message)
            throw new ApiError(401, error.message)
        }
    }
    if (!accessToken) {
        await verifyRefreshToken(refreshToken);
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        req.user = user;
        next();
    } catch (error) {
        await verifyRefreshToken(refreshToken);
    }
});
