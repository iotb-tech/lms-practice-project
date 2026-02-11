export class AppError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.name = 'AppError';
    this.data = data; 
    Error.captureStackTrace(this, this.constructor);
  }
}
