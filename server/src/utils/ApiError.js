class ApiError extends Error {
    constructor(status, message = "") {
        super(message);
        this.status = status;
        this.message = message;
        //did not understand this part
        Error.captureStackTrace(this, this.constructor)
    }
}


export { ApiError };