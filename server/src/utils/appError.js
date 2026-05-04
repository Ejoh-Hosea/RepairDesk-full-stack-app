/**
 * Custom error class for expected, operational errors (bad input, not found, etc.)
 * The errorHandler middleware uses isOperational to decide whether to log or not.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Expected error, not a bug
    Error.captureStackTrace(this, this.constructor);
  }
}
