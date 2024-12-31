import { ApiResponse } from "./ApiResponse.js"
const errorHandler = (err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json(new ApiResponse(status, null, err.message || "internal server error"))
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => next(err));

export { asyncHandler, errorHandler };