import { getDefaultErrorMessage } from "../constants.js";

export class APIResponse {
  constructor(statusCode = 500, message = "Request completed", data = {}) {
    this.statusCode = statusCode;
    this.message = message || getDefaultErrorMessage(statusCode);
    this.data = data;
    this.success = statusCode < 400;
  }
}
