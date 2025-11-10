// errorController.js
// ------------------------------
// Global error handling middleware
// ------------------------------

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // default to internal server error
  err.status = err.status || "error";

  // Development: return full error info
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    // Production: only send operational errors, hide internal details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : "Something went very wrong!",
    });
  }
};
