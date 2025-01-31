export class APIError extends Error {
    constructor(
      statusCode = 500,
      message = "Something went wrong!",
      errors,
      stack = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.message = message;
      this.errors = errors;
      this.success = false;
      this.data = null;
  
      if (stack) {
        this.stack = stack || Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  