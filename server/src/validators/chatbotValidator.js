import { z } from 'zod';

const historyTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

export const chatbotMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  history: z.array(historyTurnSchema).max(20).optional().default([]),
  // Role can come from the client (e.g. for guest screens before login). We
  // override with session role in the controller when the user is logged in.
  role: z
    .enum(['GUEST', 'DONOR', 'BENEFICIARY', 'VOLUNTEER', 'ADMIN'])
    .optional(),
  language: z.enum(['en', 'ur']).optional().default('en'),
  currentScreen: z.string().max(200).optional(),
});
