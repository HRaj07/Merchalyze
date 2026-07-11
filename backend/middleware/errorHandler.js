const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${new Date().toISOString()} - ${status} - ${message}`);

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || null,
  });
};

module.exports = { errorHandler, createError };
