import { ApiResponse } from "./ApiResponse.js"
const errorHandler = (err, req, res, next) => {
    console.log("error message : ", err.message)
    console.log("error status : ", err.status)
    const status = err.status || 500;
    return res.status(status).json(new ApiResponse(status, null, err.message || "internal server error"))
}
export default errorHandler;
