class ApiResponse {
  constructor(statuscode, data, message = "Success") {
    this.statuscode = statuscode;
    this.data = data; //{data send korta pri}
    this.message = message;
    this.statuscode = statuscode < 400;
  }
}

export { ApiResponse };
