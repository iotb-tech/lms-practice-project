export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error:", err.name, err.message);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Handle validation errors (Zod / Mongoose)
  if (err.errors) {
    response.message = "Validation failed";
    response.errors = err.errors;
  }

  // Attach structured data if exists
  if (err.data) {
    response.data = err.data;
  }

  // Show stack only in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
