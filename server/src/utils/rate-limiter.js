import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";
export const limiter = (limit) =>{
    return rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler: () => {
            throw new ApiError(429, "Too many requests, please try again later")
        }
    })
}