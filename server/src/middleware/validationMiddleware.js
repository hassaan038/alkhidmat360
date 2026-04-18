import { ApiError } from '../utils/ApiResponse.js';

/**
 * Middleware to validate request body against Zod schema
 * @param {ZodSchema} schema - Zod validation schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error.errors) {
        // Zod validation error
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ApiError(400, 'Validation failed', formattedErrors);
      }
      throw error;
    }
  };
};
