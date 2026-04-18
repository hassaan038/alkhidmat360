import { ApiError } from '../utils/ApiResponse.js';
import * as systemConfigService from '../services/systemConfigService.js';

/**
 * Middleware that blocks access when the Qurbani module is globally disabled.
 * ADMIN users bypass the check so they can continue to manage listings/config.
 * Must be used AFTER requireAuth so req.session.user is populated.
 */
export const requireQurbaniModuleActive = async (req, res, next) => {
  try {
    // Admins can always access — lets them manage config + listings off-season.
    if (req.session?.user?.userType === 'ADMIN') {
      return next();
    }

    const value = await systemConfigService.getConfig(
      'qurbani_module_enabled',
      'false'
    );

    if (value !== 'true') {
      throw new ApiError(403, 'Qurbani module is currently inactive');
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default {
  requireQurbaniModuleActive,
};
