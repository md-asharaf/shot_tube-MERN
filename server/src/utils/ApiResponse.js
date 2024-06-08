class ApiResponse {
    constructor(status, data, message = "success") {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = status >= 200 && status < 300;
    }
}


export { ApiResponse };