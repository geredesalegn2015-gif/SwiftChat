// catchAsync.js
// ------------------------------
// Utility to wrap async functions and forward errors to global error handler
// ------------------------------

export default (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); // automatically catch rejected promises
};
