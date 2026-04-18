import { ApiError } from '../utils/ApiResponse.js';

/**
 * Middleware to check if user is authenticated
 * Verifies session exists and attaches user to request
 */
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    throw new ApiError(401, 'Authentication required. Please login.');
  }

  // User ID is available in req.session.userId
  next();
};

/**
 * Middleware to check if user is an admin
 * Must be used after requireAuth middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (req.session.user.userType !== 'ADMIN') {
    throw new ApiError(403, 'Access denied. Admin privileges required.');
  }

  next();
};

/**
 * Middleware to check if user has specific role(s)
 * @param {...string} allowedRoles - Allowed user types
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.session.user.userType)) {
      throw new ApiError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    next();
  };
};
