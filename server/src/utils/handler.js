import { ApiResponse } from "./ApiResponse.js"
const errorHandler = (err, _, res) => {
    console.error("API ERROR: ", err);
    const status = (err.errorInfo || err.name === "TokenExpiredError") ? 401 : (err.status || 500);
    const message = (err.errorInfo || err.name === "TokenExpiredError") ? "Your session has expired. Please log in again to continue." : (err.message || "internal server error");
    return res.status(status).json(new ApiResponse(status, null, message))
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => next(err));

export { asyncHandler, errorHandler };