/**
 * Wraps async route handlers so unhandled promise rejections
 * are passed to Express's next() automatically.
 *
 * Without this: unhandled rejections crash the process or hang requests.
 * With this:    they flow to the global error handler cleanly.
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
