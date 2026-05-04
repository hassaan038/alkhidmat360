import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as chatbotService from '../services/chatbotService.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { message, history, role, language, currentScreen } = req.body;

  // Prefer the authenticated session's role (and name) when present so the
  // client can't impersonate a different role. Fall back to the body for
  // signed-out pages (login / signup) where there is no session.
  const sessionUser = req.session?.user;
  const effectiveRole = sessionUser?.userType || role || 'GUEST';
  const userName = sessionUser?.fullName?.split(' ')[0];

  const { reply } = await chatbotService.generateReply({
    message,
    history,
    role: effectiveRole,
    language,
    currentScreen,
    userName,
  });

  res.json(
    new ApiResponse(200, { reply, role: effectiveRole }, 'Chatbot reply generated')
  );
});
