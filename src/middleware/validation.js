
import { z } from 'zod';

export const validate = (schema) => {
 return (req, res, next) => {
  try {
   req.validated = schema.parse(req.body);
   next();
  } catch (error) {
   return res.status(400).json({
    success: false,
    status: 'error',
    message: 'Validation failed',
    errors: error.errors.map(e => e.message)
   });
  }
 };
};
