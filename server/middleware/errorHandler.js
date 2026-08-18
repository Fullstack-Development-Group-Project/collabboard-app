const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  let message = err.message || 'Internal server error';
  let errors = undefined;

  if (err.name === 'ValidationError') {
    const validationErrors = Object.fromEntries(
      Object.entries(err.errors || {}).map(([key, value]) => [key, value.message]),
    );

    errors = validationErrors;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    message = `Invalid value provided for ${err.path || 'field'}`;
  } else if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value for ${duplicateField}`;
  } else if (err.name === 'MongoServerError' && /timed out|timeout/i.test(err.message || '')) {
    message = 'Database request timed out';
  }

  const payload = {
    success: false,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
