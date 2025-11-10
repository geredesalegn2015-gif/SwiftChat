// AppError.js
// ------------------------------
// Custom Error Class for operational errors
// ------------------------------

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // call parent constructor
    this.statusCode = statusCode; // e.g., 400, 404, 500
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // HTTP status type
    this.isOperational = true; // mark as trusted error

    Error.captureStackTrace(this, this.constructor); // exclude this class from stack trace
  }
}

export default AppError;
