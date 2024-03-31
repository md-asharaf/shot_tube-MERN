class ApiError extends Error {
    constructor(statusCode, message = "", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            //did not understand this part
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export { ApiError };