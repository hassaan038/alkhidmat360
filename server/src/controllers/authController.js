import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import * as authService from '../services/authService.js';

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  // Set session
  req.session.userId = user.id;
  req.session.userType = user.userType;
  req.session.user = user;

  // Explicitly save session before sending response
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
    }
    res.status(201).json(
      new ApiResponse(201, { user }, 'User registered successfully')
    );
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.loginUser(email, password);

  // Set session
  req.session.userId = user.id;
  req.session.userType = user.userType;
  req.session.user = user;

  // Explicitly save session before sending response
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
    }
    res.json(
      new ApiResponse(200, { user }, 'Login successful')
    );
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw new ApiError(500, 'Error logging out');
    }

    res.clearCookie('alkhidmat_sid');
    res.json(
      new ApiResponse(200, null, 'Logout successful')
    );
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await authService.getUserById(req.session.userId);

  res.json(
    new ApiResponse(200, { user }, 'User fetched successfully')
  );
});
