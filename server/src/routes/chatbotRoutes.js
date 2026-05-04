import express from 'express';
import * as chatbotController from '../controllers/chatbotController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { chatbotMessageSchema } from '../validators/chatbotValidator.js';

const router = express.Router();

// Public — chatbot is available on login / signup / any page. The controller
// reads req.session for role context when the user is logged in.
router.post(
  '/message',
  validateRequest(chatbotMessageSchema),
  chatbotController.sendMessage
);

export default router;
