import api from './api';

/**
 * Send a message to the chatbot.
 * @param {Object} payload
 * @param {string} payload.message
 * @param {Array}  [payload.history]    - [{ role: 'user'|'assistant', content }]
 * @param {string} [payload.role]       - GUEST | DONOR | BENEFICIARY | VOLUNTEER | ADMIN
 * @param {string} [payload.language]   - 'en' | 'ur'
 * @param {string} [payload.currentScreen]
 * @returns {Promise<{ reply: string, role: string }>}
 */
export const sendChatbotMessage = async (payload) => {
  const res = await api.post('/chatbot/message', payload);
  return res.data?.data || { reply: '', role: 'GUEST' };
};
