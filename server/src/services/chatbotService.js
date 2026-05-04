import { ApiError } from '../utils/ApiResponse.js';
import { buildSystemPrompt } from '../prompts/chatbotPrompts.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const GEMINI_API_BASE =
  process.env.GEMINI_API_BASE ||
  'https://generativelanguage.googleapis.com/v1beta';

const MAX_HISTORY_MESSAGES = 20;
const MAX_USER_MESSAGE_CHARS = 2000;

/**
 * Generate a chatbot reply via Google Gemini.
 *
 * @param {Object} input
 * @param {string} input.message      - The latest user message.
 * @param {Array}  [input.history]    - Prior turns: [{ role: 'user'|'assistant', content }].
 * @param {string} [input.role]       - GUEST | DONOR | BENEFICIARY | VOLUNTEER | ADMIN.
 * @param {string} [input.language]   - 'en' | 'ur'.
 * @param {string} [input.currentScreen]
 * @param {string} [input.userName]
 * @returns {Promise<{ reply: string }>}
 */
export async function generateReply({
  message,
  history = [],
  role,
  language,
  currentScreen,
  userName,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      503,
      'Chatbot is not configured yet. Please set GEMINI_API_KEY in the server environment.'
    );
  }

  const trimmed = String(message || '').trim();
  if (!trimmed) throw new ApiError(400, 'Message cannot be empty');
  const safeMessage =
    trimmed.length > MAX_USER_MESSAGE_CHARS
      ? trimmed.slice(0, MAX_USER_MESSAGE_CHARS)
      : trimmed;

  const systemPrompt = buildSystemPrompt({
    role,
    language,
    currentScreen,
    userName,
  });

  // Map our history to Gemini's contents format.
  const recent = Array.isArray(history)
    ? history.slice(-MAX_HISTORY_MESSAGES)
    : [];

  const contents = [];
  for (const turn of recent) {
    if (!turn || typeof turn.content !== 'string') continue;
    const text = turn.content.trim();
    if (!text) continue;
    contents.push({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: safeMessage }] });

  const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(502, `Could not reach Gemini: ${err.message}`);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errMsg =
      data?.error?.message ||
      `Gemini request failed with status ${res.status}`;
    throw new ApiError(res.status === 429 ? 429 : 502, errMsg);
  }

  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;

  if (finishReason === 'SAFETY' || finishReason === 'BLOCKLIST') {
    return {
      reply:
        language === 'ur'
          ? 'معذرت، میں اس سوال کا جواب نہیں دے سکتا۔ براہِ کرم Alkhidmat 360 سے متعلق کوئی اور سوال پوچھیں۔'
          : "Sorry, I can't answer that. Please ask me something about Alkhidmat 360 instead.",
    };
  }

  const text = candidate?.content?.parts
    ?.map((p) => p?.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new ApiError(502, 'Empty response from Gemini');
  }

  return { reply: text };
}
